import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/promotions:
 *   get:
 *     summary: List all promotions
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, async (_req: Request, res: Response) => {
  const [promos] = await pool.query<any[]>(
    'SELECT * FROM promotions ORDER BY created_at DESC'
  );
  for (const p of promos) {
    const [products] = await pool.query<any[]>(
      `SELECT prod.id, prod.name FROM promotion_products pp
       JOIN products prod ON prod.id = pp.product_id
       WHERE pp.promotion_id = ?`,
      [p.id]
    );
    p.products = products;
  }
  res.json(promos);
});

/**
 * @openapi
 * /api/promotions/{id}:
 *   get:
 *     summary: Get single promotion
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  const [rows] = await pool.query<any[]>('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
  if (!rows[0]) { res.status(404).json({ error: 'Not found' }); return; }
  const [products] = await pool.query<any[]>(
    `SELECT prod.id, prod.name FROM promotion_products pp
     JOIN products prod ON prod.id = pp.product_id
     WHERE pp.promotion_id = ?`,
    [req.params.id]
  );
  res.json({ ...rows[0], products });
});

/**
 * @openapi
 * /api/promotions:
 *   post:
 *     summary: Create promotion
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { name, description, discount_type, discount_value, start_date, end_date, is_active, product_ids } =
    req.body as {
      name: string; description?: string; discount_type: string;
      discount_value: number; start_date: string; end_date: string;
      is_active?: number; product_ids?: number[];
    };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query<any>(
      `INSERT INTO promotions (name, description, discount_type, discount_value, start_date, end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, discount_type, discount_value, start_date, end_date, is_active ?? 1]
    );
    const promoId = result.insertId;
    if (product_ids?.length) {
      for (const pid of product_ids) {
        await conn.query(
          'INSERT INTO promotion_products (promotion_id, product_id) VALUES (?, ?)',
          [promoId, pid]
        );
      }
    }
    await conn.commit();
    res.status(201).json({ id: promoId, name });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

/**
 * @openapi
 * /api/promotions/{id}:
 *   put:
 *     summary: Update promotion
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { name, description, discount_type, discount_value, start_date, end_date, is_active, product_ids } =
    req.body as {
      name: string; description?: string; discount_type: string;
      discount_value: number; start_date: string; end_date: string;
      is_active?: number; product_ids?: number[];
    };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE promotions SET name=?, description=?, discount_type=?, discount_value=?,
       start_date=?, end_date=?, is_active=? WHERE id=?`,
      [name, description, discount_type, discount_value, start_date, end_date, is_active ?? 1, req.params.id]
    );
    if (product_ids !== undefined) {
      await conn.query('DELETE FROM promotion_products WHERE promotion_id = ?', [req.params.id]);
      for (const pid of product_ids) {
        await conn.query(
          'INSERT INTO promotion_products (promotion_id, product_id) VALUES (?, ?)',
          [req.params.id, pid]
        );
      }
    }
    await conn.commit();
    res.json({ id: req.params.id, name });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

/**
 * @openapi
 * /api/promotions/{id}:
 *   delete:
 *     summary: Delete promotion
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await pool.query('DELETE FROM promotions WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

/**
 * @openapi
 * /api/promotions/{id}/products:
 *   post:
 *     summary: Attach / detach products to a promotion
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/products', authMiddleware, async (req: Request, res: Response) => {
  const { product_ids } = req.body as { product_ids: number[] };
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM promotion_products WHERE promotion_id = ?', [req.params.id]);
    for (const pid of product_ids) {
      await conn.query(
        'INSERT INTO promotion_products (promotion_id, product_id) VALUES (?, ?)',
        [req.params.id, pid]
      );
    }
    await conn.commit();
    res.json({ success: true, count: product_ids.length });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export default router;
