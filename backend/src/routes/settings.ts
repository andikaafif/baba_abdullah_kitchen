import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// ─── Helper: get/set site_settings ───────────────────────────────────────────

async function getSetting(key: string): Promise<string | null> {
  const [rows] = await pool.query<any[]>(
    "SELECT `value` FROM site_settings WHERE `key` = ?",
    [key]
  );
  return rows[0]?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  await pool.query(
    "INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?",
    [key, value, value]
  );
}

// ─── Maintenance Mode ────────────────────────────────────────────────────────

/**
 * GET /api/settings/maintenance — Get maintenance mode status (public)
 */
router.get('/maintenance', async (_req: Request, res: Response) => {
  try {
    const enabled = (await getSetting('maintenance_mode')) === 'true';
    res.json({ maintenance_mode: enabled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/settings/maintenance — Toggle maintenance mode (admin only)
 */
router.put('/maintenance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;
    await setSetting('maintenance_mode', enabled ? 'true' : 'false');
    res.json({ maintenance_mode: enabled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Store Closure ───────────────────────────────────────────────────────────

/**
 * GET /api/settings/store-closure — Get store closure status (public)
 */
router.get('/store-closure', async (_req: Request, res: Response) => {
  try {
    const enabled = (await getSetting('store_closed')) === 'true';
    const message = (await getSetting('store_closed_message')) || 'Toko sedang tutup';
    const reopenAt = (await getSetting('store_reopen_at')) || null;
    res.json({ enabled, message, reopen_at: reopenAt });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/settings/store-closure — Update store closure settings (admin only)
 */
router.put('/store-closure', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { enabled, message, reopen_at } = req.body;
    await setSetting('store_closed', enabled ? 'true' : 'false');
    if (message !== undefined) await setSetting('store_closed_message', message);
    if (reopen_at !== undefined) await setSetting('store_reopen_at', reopen_at || '');
    res.json({ enabled, message, reopen_at });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Out-of-Stock Settings ───────────────────────────────────────────────────

/**
 * GET /api/settings/out-of-stock — Get out-of-stock config for all products (admin)
 * Returns array of products that have custom out-of-stock messages / restock dates.
 */
router.get('/out-of-stock', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>(`
      SELECT oos.*, p.name AS product_name, pv.label AS variant_label
      FROM out_of_stock_settings oos
      LEFT JOIN products p ON p.id = oos.product_id
      LEFT JOIN product_variants pv ON pv.id = oos.variant_id
      ORDER BY oos.updated_at DESC
    `);
    res.json(rows);
  } catch (err: any) {
    // Table may not exist yet — return empty array instead of 500
    if (err.code === 'ER_NO_SUCH_TABLE') {
      res.json([]);
      return;
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/settings/out-of-stock — Upsert out-of-stock setting for a variant (admin)
 * Body: { variant_id, product_id, message, restock_at }
 */
router.put('/out-of-stock', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { variant_id, product_id, message, restock_at } = req.body;
    if (!variant_id || !product_id) {
      res.status(400).json({ error: 'variant_id and product_id are required' });
      return;
    }
    await pool.query(`
      INSERT INTO out_of_stock_settings (variant_id, product_id, message, restock_at)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE message = VALUES(message), restock_at = VALUES(restock_at), updated_at = NOW()
    `, [variant_id, product_id, message || null, restock_at || null]);
    res.json({ variant_id, product_id, message, restock_at });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/settings/out-of-stock/:variantId — Remove custom OOS setting (admin)
 */
router.delete('/out-of-stock/:variantId', authMiddleware, async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM out_of_stock_settings WHERE variant_id = ?', [req.params.variantId]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
