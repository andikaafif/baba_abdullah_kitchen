import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Array of categories
 */
router.get('/', async (_req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json(rows);
});

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Create category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { name, slug } = req.body as { name: string; slug: string };
  const [result] = await pool.query<any>(
    'INSERT INTO categories (name, slug) VALUES (?, ?)',
    [name, slug]
  );
  res.status(201).json({ id: result.insertId, name, slug });
});

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { name, slug } = req.body as { name: string; slug: string };
  await pool.query('UPDATE categories SET name=?, slug=? WHERE id=?', [name, slug, req.params.id]);
  res.json({ id: req.params.id, name, slug });
});

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await pool.query('DELETE FROM categories WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

export default router;
