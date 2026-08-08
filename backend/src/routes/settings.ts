import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * GET /api/settings/maintenance — Get maintenance mode status
 * (public, no auth needed so frontend can check)
 */
router.get('/maintenance', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>(
      "SELECT `value` FROM site_settings WHERE `key` = 'maintenance_mode'"
    );
    const enabled = rows[0]?.value === 'true';
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
    const value = enabled ? 'true' : 'false';
    await pool.query(
      "INSERT INTO site_settings (`key`, `value`) VALUES ('maintenance_mode', ?) ON DUPLICATE KEY UPDATE `value` = ?",
      [value, value]
    );
    res.json({ maintenance_mode: enabled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
