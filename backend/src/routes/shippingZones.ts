import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * GET /api/shipping-zones — List all shipping zones
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, zone_name, shipping_cost, created_at FROM shipping_zones ORDER BY zone_name ASC'
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/shipping-zones — Add a shipping zone
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { zone_name, shipping_cost } = req.body;
    if (!zone_name || shipping_cost == null) {
      res.status(400).json({ error: 'zone_name and shipping_cost are required' });
      return;
    }
    const [result] = await pool.query<any>(
      'INSERT INTO shipping_zones (zone_name, shipping_cost) VALUES (?, ?)',
      [zone_name, shipping_cost]
    );
    res.status(201).json({ id: result.insertId, zone_name, shipping_cost });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/shipping-zones/:id — Update a shipping zone
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { zone_name, shipping_cost } = req.body;
    await pool.query(
      'UPDATE shipping_zones SET zone_name = ?, shipping_cost = ? WHERE id = ?',
      [zone_name, shipping_cost, req.params.id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/shipping-zones/:id
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM shipping_zones WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
