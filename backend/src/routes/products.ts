import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../db/connection';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: List all products with variants and category
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of products
 */
router.get('/', async (req: Request, res: Response) => {
  const { category_id, is_active, search } = req.query as Record<string, string>;
  let sql = `
    SELECT p.*, c.name AS category_name,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', pv.id, 'label', pv.label, 'pcs', pv.pcs,
          'price', pv.price, 'cost_price', pv.cost_price, 'stock', pv.stock
        )
      ) AS variants
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_variants pv ON pv.product_id = p.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (category_id) { sql += ' AND p.category_id = ?'; params.push(category_id); }
  if (is_active !== undefined) { sql += ' AND p.is_active = ?'; params.push(is_active); }
  if (search) { sql += ' AND p.name LIKE ?'; params.push(`%${search}%`); }

  sql += ' GROUP BY p.id ORDER BY p.created_at DESC';

  const [rows] = await pool.query<any[]>(sql, params);
  const products = rows.map((r) => ({
    ...r,
    variants: typeof r.variants === 'string' ? JSON.parse(r.variants) : r.variants,
  }));
  res.json(products);
});

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get single product
 *     tags: [Products]
 */
router.get('/:id', async (req: Request, res: Response) => {
  const [rows] = await pool.query<any[]>(
    `SELECT p.*, c.name AS category_name FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = ?`,
    [req.params.id]
  );
  if (!rows[0]) { res.status(404).json({ error: 'Not found' }); return; }
  const [variants] = await pool.query<any[]>(
    'SELECT * FROM product_variants WHERE product_id = ? ORDER BY id',
    [req.params.id]
  );
  res.json({ ...rows[0], variants });
});

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Create product with variants
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, category_id]
 *             properties:
 *               name:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *               variants:
 *                 type: string
 *                 description: JSON array of variants
 */
router.post('/', authMiddleware, upload.single('photo'), async (req: Request, res: Response) => {
  const { name, category_id, description } = req.body as Record<string, string>;
  const variantsRaw = req.body.variants as string | undefined;
  const photo_url = req.file
    ? `/uploads/${req.file.filename}`
    : (req.body.photo_url as string | undefined) || null;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query<any>(
      'INSERT INTO products (name, photo_url, category_id, description) VALUES (?, ?, ?, ?)',
      [name, photo_url, category_id, description]
    );
    const productId = result.insertId;

    if (variantsRaw) {
      const variants = JSON.parse(variantsRaw) as Array<{
        label: string; pcs: string; price: number; cost_price?: number; stock?: number;
      }>;
      for (const v of variants) {
        await conn.query(
          'INSERT INTO product_variants (product_id, label, pcs, price, cost_price, stock) VALUES (?, ?, ?, ?, ?, ?)',
          [productId, v.label, v.pcs, v.price, v.cost_price ?? 0, v.stock ?? 0]
        );
      }
    }
    await conn.commit();
    res.status(201).json({ id: productId, name, photo_url });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, upload.single('photo'), async (req: Request, res: Response) => {
  const { name, category_id, description, is_active } = req.body as Record<string, string>;
  const variantsRaw = req.body.variants as string | undefined;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : req.body.photo_url || null;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE products SET name=?, photo_url=?, category_id=?, description=?, is_active=?, updated_at=NOW() WHERE id=?',
      [name, photo_url, category_id, description, is_active ?? 1, req.params.id]
    );
    if (variantsRaw) {
      const variants = JSON.parse(variantsRaw) as Array<{
        id?: number; label: string; pcs: string; price: number; cost_price?: number; stock?: number;
      }>;
      await conn.query('DELETE FROM product_variants WHERE product_id = ?', [req.params.id]);
      for (const v of variants) {
        await conn.query(
          'INSERT INTO product_variants (product_id, label, pcs, price, cost_price, stock) VALUES (?, ?, ?, ?, ?, ?)',
          [req.params.id, v.label, v.pcs, v.price, v.cost_price ?? 0, v.stock ?? 0]
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
 * /api/products/{id}:
 *   delete:
 *     summary: Soft-delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await pool.query('UPDATE products SET is_active=0 WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

/**
 * @openapi
 * /api/products/{id}/inventory:
 *   patch:
 *     summary: Update stock per variant
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/inventory', authMiddleware, async (req: Request, res: Response) => {
  const updates = req.body.variants as Array<{
    variant_id: number; stock: number; change_qty?: number; reason?: string;
  }>;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const u of updates) {
      await conn.query('UPDATE product_variants SET stock=? WHERE id=? AND product_id=?', [
        u.stock, u.variant_id, req.params.id,
      ]);
      if (u.change_qty !== undefined) {
        await conn.query(
          'INSERT INTO inventory_logs (product_variant_id, change_qty, reason) VALUES (?, ?, ?)',
          [u.variant_id, u.change_qty, u.reason ?? 'manual adjustment']
        );
      }
    }
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export default router;
