import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Helper: build date filter clause
function dateFilter(from?: string, to?: string, col = 'e.created_at') {
  const clauses: string[] = [];
  const params: string[] = [];
  if (from) { clauses.push(`DATE(${col}) >= ?`); params.push(from); }
  if (to) { clauses.push(`DATE(${col}) <= ?`); params.push(to); }
  return { clause: clauses.length ? ' AND ' + clauses.join(' AND ') : '', params };
}

/**
 * GET /api/expenses — List expenses with optional period filter
 * Query params: period (daily|weekly|monthly), from, to
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as Record<string, string>;
    const { clause, params } = dateFilter(from, to);
    const sql = `
      SELECT id, purpose, quantity, original_price, expense_cost, created_at
      FROM expenses e
      WHERE 1=1 ${clause}
      ORDER BY e.created_at DESC
    `;
    const [rows] = await pool.query<any[]>(sql, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/expenses/summary — Aggregated expense totals by period
 */
router.get('/summary', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { period = 'daily', from, to } = req.query as Record<string, string>;
    const { clause, params } = dateFilter(from, to);

    let groupBy: string;
    let label: string;
    if (period === 'weekly') {
      groupBy = "YEARWEEK(e.created_at, 1)";
      label = "DATE_FORMAT(MIN(e.created_at), '%Y-W%u')";
    } else if (period === 'monthly') {
      groupBy = "DATE_FORMAT(e.created_at, '%Y-%m')";
      label = "DATE_FORMAT(e.created_at, '%Y-%m')";
    } else {
      groupBy = "DATE(e.created_at)";
      label = "DATE(e.created_at)";
    }

    const sql = `
      SELECT
        ${label} AS period_label,
        COUNT(*) AS item_count,
        SUM(expense_cost) AS total_expense
      FROM expenses e
      WHERE 1=1 ${clause}
      GROUP BY ${groupBy}
      ORDER BY MIN(e.created_at) ASC
    `;
    const [rows] = await pool.query<any[]>(sql, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/expenses — Create a new expense
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { purpose, quantity, original_price } = req.body;
    if (!purpose || !quantity || !original_price) {
      res.status(400).json({ error: 'purpose, quantity, and original_price are required' });
      return;
    }
    const [result] = await pool.query<any>(
      'INSERT INTO expenses (purpose, quantity, original_price) VALUES (?, ?, ?)',
      [purpose, quantity, original_price]
    );
    res.status(201).json({ id: result.insertId, purpose, quantity, original_price });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/expenses/:id
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
