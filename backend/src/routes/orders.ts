import { Router, Request, Response } from 'express';
import { pool, query } from '../db';
import { authenticateToken, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

// Create Order (Database Transaction with authoritative pricing & stock deduction)
// Order is saved in PostgreSQL BEFORE opening WhatsApp. Payment remains 'awaiting_payment'.
router.post('/', async (req: Request, res: Response) => {
  const { customerName, customerPhone, deliveryAddress, items, userId } = req.body;

  if (!customerName || !customerPhone || !deliveryAddress || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Incomplete order: customerName, customerPhone, deliveryAddress, and items are required.',
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Authoritative price calculation and stock validation from database
    let calculatedSubtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new Error('Each item must have a valid productId and quantity greater than zero.');
      }

      const prodRes = await client.query(
        'SELECT id, name, price, stock, is_available FROM products WHERE id = $1 FOR UPDATE',
        [item.productId]
      );

      if (prodRes.rows.length === 0) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const product = prodRes.rows[0];

      if (!product.is_available) {
        throw new Error(`Product "${product.name}" is currently unavailable.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`
        );
      }

      const unitPrice = Math.round(Number(product.price));
      const lineSubtotal = unitPrice * item.quantity;
      calculatedSubtotal += lineSubtotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity: item.quantity,
        subtotal: lineSubtotal,
        variationDetails: item.variationDetails || null,
      });

      // Deduct stock safely
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [
        item.quantity,
        product.id,
      ]);
    }

    const deliveryFee = env.deliveryFeeRwf;
    const totalAmount = calculatedSubtotal + deliveryFee;
    const orderReference = `DG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Insert into orders table (Strictly saved as awaiting_payment)
    const orderRes = await client.query(
      `INSERT INTO orders (
        order_reference, user_id, customer_name, customer_phone,
        delivery_address, subtotal, delivery_fee, total_amount,
        status, payment_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_confirmation', 'awaiting_payment')
      RETURNING *`,
      [
        orderReference,
        userId || null,
        String(customerName).trim(),
        String(customerPhone).trim(),
        JSON.stringify(deliveryAddress),
        calculatedSubtotal,
        deliveryFee,
        totalAmount,
      ]
    );

    const order = orderRes.rows[0];

    // 3. Insert line items
    for (const vItem of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal, variation_details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.id,
          vItem.productId,
          vItem.productName,
          vItem.unitPrice,
          vItem.quantity,
          vItem.subtotal,
          vItem.variationDetails,
        ]
      );
    }

    // 4. Create initial payment audit record (awaiting verification)
    await client.query(
      `INSERT INTO payments (order_id, amount, payment_method, status, notes)
       VALUES ($1, $2, 'whatsapp_momo', 'awaiting_payment', 'Order created. Payment to be coordinated via WhatsApp.')`,
      [order.id, totalAmount]
    );

    await client.query('COMMIT');

    // Generate WhatsApp payment message URL for DG Shop Owner
    const itemsSummary = validatedItems
      .map((i) => `• ${i.productName} (x${i.quantity}) - ${i.subtotal.toLocaleString()} RWF`)
      .join('\n');

    const addressText = typeof deliveryAddress === 'object'
      ? `${deliveryAddress.district || 'Rwamagana'}, ${deliveryAddress.sector || ''} - ${deliveryAddress.streetDetails || ''}`
      : String(deliveryAddress);

    const whatsappMessage = encodeURIComponent(
      `Hello DG E-Commerce! 👋\n` +
      `I would like to arrange payment for my order.\n\n` +
      `📦 Order Reference: ${orderReference}\n` +
      `👤 Customer: ${customerName}\n` +
      `📞 Phone: ${customerPhone}\n` +
      `📍 Delivery To: ${addressText}\n\n` +
      `Items:\n${itemsSummary}\n\n` +
      `🚚 Delivery Fee: ${deliveryFee.toLocaleString()} RWF\n` +
      `💰 Total: ${totalAmount.toLocaleString()} RWF\n\n` +
      `Please provide MTN MoMo / Airtel Money payment instructions.`
    );

    const whatsappUrl = env.whatsappPhone
      ? `https://wa.me/${env.whatsappPhone}?text=${whatsappMessage}`
      : `https://wa.me/?text=${whatsappMessage}`;

    res.status(201).json({
      success: true,
      data: {
        id: order.id,
        orderReference: order.order_reference,
        totalAmount: Number(order.total_amount),
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.delivery_fee),
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        whatsappUrl,
      },
      message: 'Order created successfully and saved in database. Opening WhatsApp coordinates payment without auto-marking paid.',
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// List Orders (Customer sees only own orders; Admin sees all)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let sql = `
      SELECT o.id, o.order_reference as "orderReference", o.user_id as "userId",
             o.customer_name as "customerName", o.customer_phone as "customerPhone",
             o.delivery_address as "deliveryAddress", o.subtotal, o.delivery_fee as "deliveryFee",
             o.total_amount as "totalAmount", o.status, o.payment_status as "paymentStatus",
             o.payment_notes as "paymentNotes", o.verified_at as "verifiedAt",
             o.created_at as "createdAt", o.updated_at as "updatedAt",
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'productId', oi.product_id,
                   'productName', oi.product_name,
                   'unitPrice', oi.unit_price,
                   'quantity', oi.quantity,
                   'subtotal', oi.subtotal,
                   'variationDetails', oi.variation_details,
                   'imageUrl', (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = oi.product_id ORDER BY pi.sort_order LIMIT 1)
                 )
               ) FILTER (WHERE oi.id IS NOT NULL),
               '[]'
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    const params: any[] = [];

    // If customer, restrict to their own orders
    if (req.user!.role !== 'admin') {
      sql += ' WHERE o.user_id = $1';
      params.push(req.user!.id);
    } else {
      // Optional admin filters
      const { status, paymentStatus } = req.query;
      const conditions: string[] = [];
      if (status && status !== 'all') {
        params.push(status);
        conditions.push(`o.status = $${params.length}`);
      }
      if (paymentStatus && paymentStatus !== 'all') {
        params.push(paymentStatus);
        conditions.push(`o.payment_status = $${params.length}`);
      }
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    sql += ' GROUP BY o.id ORDER BY o.created_at DESC';

    const result = await query(sql, params);
    res.json({
      success: true,
      data: result.rows.map((row: any) => ({
        ...row,
        subtotal: Number(row.subtotal),
        deliveryFee: Number(row.deliveryFee),
        totalAmount: Number(row.totalAmount),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Sales Reports & Analytics
router.get('/admin/reports', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    // 1. Overall stats
    const statsRes = await query(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as total_revenue,
        COUNT(*) FILTER (WHERE payment_status = 'awaiting_payment') as awaiting_payment_count,
        COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_orders_count,
        COUNT(*) FILTER (WHERE status = 'pending_confirmation') as pending_fulfillment_count,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders_count,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders_count
      FROM orders
    `);

    // 2. Revenue by category
    const catRevenueRes = await query(`
      SELECT c.name as category, COALESCE(SUM(oi.subtotal), 0) as revenue, COUNT(oi.id) as units_sold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE o.payment_status = 'paid'
      GROUP BY c.name
      ORDER BY revenue DESC
    `);

    // 3. Top selling products
    const topProductsRes = await query(`
      SELECT oi.product_name, SUM(oi.quantity) as total_quantity, SUM(oi.subtotal) as total_sales
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid'
      GROUP BY oi.product_name
      ORDER BY total_quantity DESC
      LIMIT 5
    `);

    // 4. Low stock alert (stock <= 5)
    const lowStockRes = await query(`
      SELECT p.id, p.name, p.stock, c.name as category, p.price
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.stock <= 5
      ORDER BY p.stock ASC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        totalRevenueRwf: Number(statsRes.rows[0].total_revenue),
        totalOrders: Number(statsRes.rows[0].total_orders),
        awaitingPayment: Number(statsRes.rows[0].awaiting_payment_count),
        paidOrders: Number(statsRes.rows[0].paid_orders_count),
        pendingFulfillment: Number(statsRes.rows[0].pending_fulfillment_count),
        deliveredOrders: Number(statsRes.rows[0].delivered_orders_count),
        cancelledOrders: Number(statsRes.rows[0].cancelled_orders_count),
        revenueByCategory: catRevenueRes.rows.map((r: any) => ({
          category: r.category,
          revenue: Number(r.revenue),
          unitsSold: Number(r.units_sold),
        })),
        topProducts: topProductsRes.rows.map((r: any) => ({
          name: r.product_name,
          quantity: Number(r.total_quantity),
          sales: Number(r.total_sales),
        })),
        lowStockAlerts: lowStockRes.rows,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Customers List
router.get('/admin/customers', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT u.id, u.full_name as "fullName", u.email, u.phone, u.created_at as "createdAt",
             COUNT(o.id) as "ordersCount",
             COALESCE(SUM(o.total_amount) FILTER (WHERE o.payment_status = 'paid'), 0) as "totalSpentRwf"
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows.map((r: any) => ({
        ...r,
        ordersCount: Number(r.ordersCount),
        totalSpentRwf: Number(r.totalSpentRwf),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Single Order Details with Line Items & Payment History
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const orderRes = await query(
      `SELECT * FROM orders WHERE id::text = $1 OR order_reference = $1`,
      [id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const order = orderRes.rows[0];

    // Authorization & customer isolation check:
    // If order is tied to a user_id, ensure only the owner or an admin can access it.
    if (order.user_id) {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required to view this order.',
        });
      }
      if (req.user.role !== 'admin' && req.user.id !== order.user_id) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to view another customer\'s order.',
        });
      }
    }

    const itemsRes = await query(
      `SELECT oi.*,
              COALESCE((SELECT image_url FROM product_images WHERE product_id = oi.product_id ORDER BY sort_order LIMIT 1), '') as image_url
       FROM order_items oi
       WHERE oi.order_id = $1`,
      [order.id]
    );

    const paymentsRes = await query(
      `SELECT p.*, u.full_name as verified_by_name
       FROM payments p
       LEFT JOIN users u ON p.verified_by = u.id
       WHERE p.order_id = $1 ORDER BY p.created_at ASC`,
      [order.id]
    );

    res.json({
      success: true,
      data: {
        id: order.id,
        orderReference: order.order_reference,
        userId: order.user_id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        deliveryAddress: order.delivery_address,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.delivery_fee),
        totalAmount: Number(order.total_amount),
        status: order.status,
        paymentStatus: order.payment_status,
        paymentNotes: order.payment_notes,
        verifiedBy: order.verified_by,
        verifiedAt: order.verified_at,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: itemsRes.rows.map((r: any) => ({
          id: r.id,
          productId: r.product_id,
          productName: r.product_name,
          unitPrice: Number(r.unit_price),
          quantity: r.quantity,
          subtotal: Number(r.subtotal),
          variationDetails: r.variation_details,
          imageUrl: r.image_url,
        })),
        payments: paymentsRes.rows,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Update Order Fulfillment Status
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending_confirmation', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status: ${status}` });
  }

  // Define allowed order-status state transitions
  const validTransitions: Record<string, string[]> = {
    pending_confirmation: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [], // Terminal state: cannot be cancelled or moved back
    cancelled: [], // Terminal state: cannot be fulfilled or moved back
  };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const checkRes = await client.query('SELECT id, status, stock_restored FROM orders WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      throw new Error('Order not found.');
    }

    const currentOrder = checkRes.rows[0];

    // Check transition rules if status is changing
    if (currentOrder.status !== status) {
      const allowedNext = validTransitions[currentOrder.status] || [];
      if (!allowedNext.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status transition from "${currentOrder.status}" to "${status}".`,
        });
      }
    }

    // If cancelling and stock was not previously restored, restore inventory!
    if (status === 'cancelled' && !currentOrder.stock_restored) {
      const itemsRes = await client.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [id]);
      for (const item of itemsRes.rows) {
        if (item.product_id) {
          await client.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
        }
      }
      await client.query('UPDATE orders SET stock_restored = true WHERE id = $1', [id]);
    }

    const result = await client.query(
      `UPDATE orders
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    await client.query('COMMIT');

    res.json({ success: true, data: result.rows[0], message: `Order status updated to ${status}.` });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// Admin: Verify WhatsApp Payment (Manual verification required by DG Owner)
router.patch('/:id/verify-payment', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { paymentStatus, notes } = req.body;

  const validPaymentStatuses = ['paid', 'payment_rejected', 'payment_under_review', 'refunded'];
  if (!validPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ success: false, error: `Invalid payment status: ${paymentStatus}` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `UPDATE orders
       SET payment_status = $1,
           verified_by = $2,
           verified_at = CURRENT_TIMESTAMP,
           payment_notes = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [paymentStatus, req.user!.id, notes || `Verified by DG Admin (${req.user!.fullName})`, id]
    );

    if (orderRes.rows.length === 0) {
      throw new Error('Order not found.');
    }

    // Insert payment verification audit log
    await client.query(
      `INSERT INTO payments (order_id, amount, payment_method, status, verified_by, verified_at, notes)
       VALUES ($1, $2, 'whatsapp_momo', $3, $4, CURRENT_TIMESTAMP, $5)`,
      [id, orderRes.rows[0].total_amount, paymentStatus, req.user!.id, notes || `Admin verified: ${paymentStatus}`]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: orderRes.rows[0],
      message: `Payment status updated to ${paymentStatus}. Verified by DG administrator.`,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

export default router;
