import { Response } from 'express';
import { query } from '../db';

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  order_id: string | null;
  order_reference: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: string;
  orderId?: string | null;
  orderReference?: string | null;
}

// Map of active Server-Sent Events (SSE) connections keyed by user ID
const sseClients = new Map<string, Set<Response>>();

export class NotificationService {
  /**
   * Registers an SSE client for real-time live notification pushes
   */
  public static addSSEClient(userId: string, res: Response): void {
    if (!sseClients.has(userId)) {
      sseClients.set(userId, new Set());
    }
    sseClients.get(userId)!.add(res);
  }

  /**
   * Removes an SSE client when connection closes
   */
  public static removeSSEClient(userId: string, res: Response): void {
    const clients = sseClients.get(userId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        sseClients.delete(userId);
      }
    }
  }

  /**
   * Dispatches a live SSE event to all connected sockets of a user
   */
  public static dispatchSSE(userId: string, event: string, data: any): void {
    const clients = sseClients.get(userId);
    if (clients && clients.size > 0) {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      clients.forEach((res) => {
        try {
          res.write(payload);
        } catch {
          // Handled on close
        }
      });
    }
  }

  /**
   * Creates a notification for a specific user, persists to DB, and broadcasts via SSE
   */
  public static async createNotification(
    params: CreateNotificationParams
  ): Promise<NotificationRecord> {
    const { userId, title, message, type = 'order_update', orderId = null, orderReference = null } =
      params;

    const result = await query(
      `INSERT INTO notifications (user_id, title, message, type, order_id, order_reference)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title, message, type, orderId, orderReference]
    );

    const notification: NotificationRecord = result.rows[0];

    // Push live to client via SSE immediately
    this.dispatchSSE(userId, 'notification', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      orderId: notification.order_id,
      orderReference: notification.order_reference,
      isRead: notification.is_read,
      createdAt: notification.created_at,
    });

    return notification;
  }

  /**
   * Notifies all Admin users (DG Store Owners) about new orders or important store events
   */
  public static async notifyAdmins(
    params: Omit<CreateNotificationParams, 'userId'>
  ): Promise<NotificationRecord[]> {
    const adminsRes = await query(`SELECT id FROM users WHERE role = 'admin'`);
    const created: NotificationRecord[] = [];

    for (const admin of adminsRes.rows) {
      const n = await this.createNotification({
        ...params,
        userId: admin.id,
      });
      created.push(n);
    }

    return created;
  }

  /**
   * Convenience method to notify customer if order is attached to a registered user
   */
  public static async notifyCustomer(
    userId: string | null | undefined,
    params: Omit<CreateNotificationParams, 'userId'>
  ): Promise<NotificationRecord | null> {
    if (!userId) {
      return null;
    }
    return this.createNotification({
      ...params,
      userId,
    });
  }

  /**
   * Gets unread notification count for a user
   */
  public static async getUnreadCount(userId: string): Promise<number> {
    const res = await query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return Number(res.rows[0]?.count || 0);
  }
}
