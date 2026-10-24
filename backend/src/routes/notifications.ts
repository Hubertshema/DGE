import { Router, Response } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

const router = Router();

// All notification routes require an authenticated user
router.use(authenticateToken);

/**
 * GET /api/v1/notifications
 * Retrieves paginated notification history for the authenticated user
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  try {
    const countRes = await query(
      `SELECT COUNT(*) as total FROM notifications WHERE user_id = $1`,
      [userId]
    );
    const total = Number(countRes.rows[0]?.total || 0);

    const result = await query(
      `SELECT id, user_id as "userId", title, message, type,
              order_id as "orderId", order_reference as "orderReference",
              is_read as "isRead", read_at as "readAt", created_at as "createdAt"
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const unreadCount = await NotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        total,
        unreadCount,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/notifications/unread-count
 * Fast endpoint for retrieving the unread count badge
 */
router.get('/unread-count', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  try {
    const unreadCount = await NotificationService.getUnreadCount(userId);
    res.json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Marks a single notification as read
 */
router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const result = await query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id as "userId", title, message, type,
                 order_id as "orderId", order_reference as "orderReference",
                 is_read as "isRead", read_at as "readAt", created_at as "createdAt"`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found.' });
    }

    const unreadCount = await NotificationService.getUnreadCount(userId);

    // Notify client via SSE of updated unread count
    NotificationService.dispatchSSE(userId, 'unread_count', { unreadCount });

    res.json({
      success: true,
      data: {
        notification: result.rows[0],
        unreadCount,
      },
      message: 'Notification marked as read.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/notifications/mark-all-read
 * Marks all notifications for the authenticated user as read
 */
router.post('/mark-all-read', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    await query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    // Notify client via SSE of updated unread count
    NotificationService.dispatchSSE(userId, 'unread_count', { unreadCount: 0 });

    res.json({
      success: true,
      data: {
        unreadCount: 0,
      },
      message: 'All notifications marked as read.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/notifications/device-token
 * Registers an Android device push token for push notifications
 */
router.post('/device-token', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { token, platform = 'android' } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Push token is required.' });
  }

  try {
    await query(
      `INSERT INTO device_push_tokens (user_id, token, platform, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, token)
       DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
      [userId, token, platform]
    );

    res.json({
      success: true,
      message: 'Device push token registered successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/notifications/stream
 * Server-Sent Events (SSE) live push stream for instant in-app delivery and unread count sync
 */
router.get('/stream', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  // Set required SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Send initial connection packet with current unread count
  const initialUnread = await NotificationService.getUnreadCount(userId);
  res.write(`event: connected\ndata: ${JSON.stringify({ userId, unreadCount: initialUnread })}\n\n`);

  // Register client
  NotificationService.addSSEClient(userId, res);

  // Periodic heartbeat every 25 seconds
  const heartbeatTimer = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch {
      clearInterval(heartbeatTimer);
    }
  }, 25000);

  // Cleanup on client close
  req.on('close', () => {
    clearInterval(heartbeatTimer);
    NotificationService.removeSSEClient(userId, res);
  });
});

export default router;
