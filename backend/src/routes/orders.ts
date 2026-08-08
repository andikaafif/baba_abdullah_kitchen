import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: List orders with optional filters
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const { status, from, to, page = '1', limit = '20' } = req.query as Record<string, string>;
  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params: unknown[] = [];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (from) { sql += ' AND DATE(created_at) >= ?'; params.push(from); }
  if (to) { sql += ' AND DATE(created_at) <= ?'; params.push(to); }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), (Number(page) - 1) * Number(limit));
  const [rows] = await pool.query<any[]>(sql, params);
  res.json(rows);
});

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get order with items
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  const [orders] = await pool.query<any[]>('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (!orders[0]) { res.status(404).json({ error: 'Not found' }); return; }
  const [items] = await pool.query<any[]>(
    'SELECT * FROM order_items WHERE order_id = ?',
    [req.params.id]
  );
  res.json({ ...orders[0], items });
});

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create order (from PWA checkout)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_name, items, delivery_method, payment_method]
 *             properties:
 *               customer_name:
 *                 type: string
 *               customer_phone:
 *                 type: string
 *               customer_address:
 *                 type: string
 *               delivery_method:
 *                 type: string
 *               payment_method:
 *                 type: string
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 */
router.post('/', async (req: Request, res: Response) => {
  const {
    customer_name, customer_phone, customer_address,
    delivery_method, payment_method, notes, items,
  } = req.body as {
    customer_name: string;
    customer_phone?: string;
    customer_address?: string;
    delivery_method: string;
    payment_method: string;
    notes?: string;
    items: Array<{
      product_variant_id?: number;
      product_name: string;
      variant_label: string;
      quantity: number;
      unit_price: number;
      unit_cost?: number;
    }>;
  };

  const order_number = `ORD-${Date.now()}`;
  let total_price = 0;
  let profit = 0;
  for (const item of items) {
    const subtotal = item.unit_price * item.quantity;
    total_price += subtotal;
    profit += ((item.unit_price - (item.unit_cost ?? 0)) * item.quantity);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query<any>(
      `INSERT INTO orders
        (order_number, customer_name, customer_phone, customer_address,
         delivery_method, payment_method, total_price, profit, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_number, customer_name, customer_phone, customer_address,
       delivery_method, payment_method, total_price, profit, notes]
    );
    const orderId = result.insertId;

    for (const item of items) {
      const subtotal = item.unit_price * item.quantity;
      await conn.query(
        `INSERT INTO order_items
          (order_id, product_variant_id, product_name, variant_label,
           quantity, unit_price, unit_cost, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_variant_id ?? null, item.product_name,
         item.variant_label, item.quantity, item.unit_price, item.unit_cost ?? 0, subtotal]
      );
      if (item.product_variant_id) {
        await conn.query(
          'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_variant_id]
        );
        await conn.query(
          'INSERT INTO inventory_logs (product_variant_id, change_qty, reason) VALUES (?, ?, ?)',
          [item.product_variant_id, -item.quantity, `Order ${order_number}`]
        );
      }
    }
    await conn.commit();
    res.status(201).json({ id: orderId, order_number, total_price });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

/**
 * @openapi
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  const { status } = req.body as { status: string };
  await pool.query('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);
  res.json({ id: req.params.id, status });
});

export default router;
