import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/connection';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * GET /api/users — List all admin users (no passwords)
 */
router.get('/', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, username, created_at FROM admin_users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/users — Add a new admin user
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'username and password are required' });
      return;
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query<any>(
      'INSERT INTO admin_users (username, password) VALUES (?, ?)',
      [username, hash]
    );
    res.status(201).json({ id: result.insertId, username });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/users/:id/password — Change password
 */
router.put('/:id/password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: 'password is required' });
      return;
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE admin_users SET password = ? WHERE id = ?', [hash, req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/users/:id — Remove a user
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<any[]>('SELECT COUNT(*) AS cnt FROM admin_users');
    if (rows[0].cnt <= 1) {
      res.status(400).json({ error: 'Cannot delete the last admin user' });
      return;
    }
    await pool.query('DELETE FROM admin_users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
