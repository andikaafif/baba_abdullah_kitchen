import { Router, Request, Response } from 'express';
import XLSX from 'xlsx';
import { pool } from '../db/connection';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Helper: build date filter clause
function dateFilter(from?: string, to?: string, col = 'o.created_at') {
  const clauses: string[] = [];
  const params: string[] = [];
  if (from) { clauses.push(`DATE_FORMAT(${col}, '%Y-%m-%d') >= ?`); params.push(from); }
  if (to) { clauses.push(`DATE_FORMAT(${col}, '%Y-%m-%d') <= ?`); params.push(to); }
  return { clause: clauses.length ? ' AND ' + clauses.join(' AND ') : '', params };
}

/**
 * @openapi
 * /api/reports/sales:
 *   get:
 *     summary: Sales totals by period
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
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
router.get('/sales', authMiddleware, async (req: Request, res: Response) => {
  const { period = 'daily', from, to } = req.query as Record<string, string>;
  const { clause, params } = dateFilter(from, to);

  let groupBy: string;
  let label: string;
  if (period === 'weekly') {
    groupBy = "YEARWEEK(o.created_at, 1)";
    label = "DATE_FORMAT(MIN(o.created_at), '%Y-W%u')";
  } else if (period === 'monthly') {
    groupBy = "DATE_FORMAT(o.created_at, '%Y-%m')";
    label = "DATE_FORMAT(o.created_at, '%Y-%m')";
  } else {
    groupBy = "DATE(o.created_at)";
    label = "DATE_FORMAT(o.created_at, '%Y-%m-%d')";
  }

  const sql = `
    SELECT
      sub.period_label,
      sub.order_count,
      sub.total_revenue,
      COALESCE(items.total_items_sold, 0) AS total_items_sold
    FROM (
      SELECT
        ${label} AS period_label,
        ${groupBy} AS grp,
        COUNT(*) AS order_count,
        SUM(o.total_price) AS total_revenue
      FROM orders o
      WHERE o.status NOT IN ('cancelled')
      ${clause}
      GROUP BY ${groupBy}
    ) sub
    LEFT JOIN (
      SELECT
        ${groupBy} AS grp,
        SUM(oi.quantity) AS total_items_sold
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.status NOT IN ('cancelled')
      ${clause}
      GROUP BY ${groupBy}
    ) items ON items.grp = sub.grp
    ORDER BY sub.period_label ASC
  `;
  const [rows] = await pool.query<any[]>(sql, [...params, ...params]);
  res.json(rows.map((r) => ({ ...r, order_count: Number(r.order_count), total_revenue: Number(r.total_revenue), total_items_sold: Number(r.total_items_sold) })));
});

/**
 * @openapi
 * /api/reports/profit:
 *   get:
 *     summary: Profit totals by period
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profit', authMiddleware, async (req: Request, res: Response) => {
  const { period = 'daily', from, to } = req.query as Record<string, string>;
  const { clause, params } = dateFilter(from, to);

  let groupBy: string;
  let label: string;
  if (period === 'weekly') {
    groupBy = "YEARWEEK(o.created_at, 1)";
    label = "DATE_FORMAT(MIN(o.created_at), '%Y-W%u')";
  } else if (period === 'monthly') {
    groupBy = "DATE_FORMAT(o.created_at, '%Y-%m')";
    label = "DATE_FORMAT(o.created_at, '%Y-%m')";
  } else {
    groupBy = "DATE(o.created_at)";
    label = "DATE_FORMAT(o.created_at, '%Y-%m-%d')";
  }

  const sql = `
    SELECT
      ${label} AS period_label,
      COUNT(*) AS order_count,
      SUM(o.total_price) AS total_revenue,
      SUM(o.profit) AS total_profit
    FROM orders o
    WHERE o.status NOT IN ('cancelled')
    ${clause}
    GROUP BY ${groupBy}
    ORDER BY MIN(o.created_at) ASC
  `;
  const [rows] = await pool.query<any[]>(sql, params);
  res.json(rows.map((r) => ({ ...r, order_count: Number(r.order_count), total_revenue: Number(r.total_revenue), total_profit: Number(r.total_profit) })));
});

/**
 * @openapi
 * /api/reports/top-variants:
 *   get:
 *     summary: Best selling variants
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get('/top-variants', authMiddleware, async (req: Request, res: Response) => {
  const { category, from, to, limit = '10' } = req.query as Record<string, string>;
  const { clause, params } = dateFilter(from, to);
  const extra: unknown[] = [...params];

  let categoryClause = '';
  if (category) {
    categoryClause = ' AND c.slug = ?';
    extra.push(category);
  }

  const sql = `
    SELECT
      pv.id AS variant_id,
      p.name AS product_name,
      c.name AS category_name,
      pv.label AS variant_label,
      pv.pcs,
      SUM(oi.quantity) AS total_sold,
      SUM(oi.subtotal) AS total_revenue
    FROM order_items oi
    JOIN product_variants pv ON pv.id = oi.product_variant_id
    JOIN products p ON p.id = pv.product_id
    JOIN categories c ON c.id = p.category_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status NOT IN ('cancelled')
    ${clause}
    ${categoryClause}
    GROUP BY pv.id, p.name, c.name, pv.label, pv.pcs
    ORDER BY total_sold DESC
    LIMIT ?
  `;
  extra.push(Number(limit));
  const [rows] = await pool.query<any[]>(sql, extra);
  res.json(rows.map((r) => ({ ...r, total_sold: Number(r.total_sold), total_revenue: Number(r.total_revenue) })));
});

/**
 * @openapi
 * /api/reports/sales/table:
 *   get:
 *     summary: Tabular sales breakdown
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/sales/table', authMiddleware, async (req: Request, res: Response) => {
  const { from, to } = req.query as Record<string, string>;
  const { clause, params } = dateFilter(from, to);
  const sql = `
    SELECT
      o.order_number,
      o.customer_name,
      o.delivery_method,
      o.payment_method,
      o.total_price,
      o.profit,
      o.status,
      o.created_at,
      COUNT(oi.id) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE 1=1 ${clause}
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
  const [rows] = await pool.query<any[]>(sql, params);
  res.json(rows);
});

/**
 * @openapi
 * /api/reports/export/excel:
 *   get:
 *     summary: Export all sales as Excel
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/export/excel', authMiddleware, async (req: Request, res: Response) => {
  const { from, to } = req.query as Record<string, string>;
  const { clause, params } = dateFilter(from, to);

  const [orderRows] = await pool.query<any[]>(
    `SELECT o.order_number, o.customer_name, o.customer_phone, o.delivery_method,
            o.payment_method, o.total_price, o.profit, o.status, o.created_at
     FROM orders o
     WHERE 1=1 ${clause}
     ORDER BY o.created_at DESC`,
    params
  );

  const [itemRows] = await pool.query<any[]>(
    `SELECT o.order_number, oi.product_name, oi.variant_label,
            oi.quantity, oi.unit_price, oi.subtotal
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE 1=1 ${clause}
     ORDER BY o.created_at DESC, oi.id`,
    params
  );

  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(
    orderRows.map((r) => ({
      'No. Order': r.order_number,
      'Pelanggan': r.customer_name,
      'Telepon': r.customer_phone,
      'Pengiriman': r.delivery_method,
      'Pembayaran': r.payment_method,
      'Total (Rp)': r.total_price,
      'Profit (Rp)': r.profit,
      'Status': r.status,
      'Tanggal': new Date(r.created_at).toLocaleString('id-ID'),
    }))
  );
  XLSX.utils.book_append_sheet(wb, ws1, 'Pesanan');

  const ws2 = XLSX.utils.json_to_sheet(
    itemRows.map((r) => ({
      'No. Order': r.order_number,
      'Produk': r.product_name,
      'Varian': r.variant_label,
      'Qty': r.quantity,
      'Harga Satuan (Rp)': r.unit_price,
      'Subtotal (Rp)': r.subtotal,
    }))
  );
  XLSX.utils.book_append_sheet(wb, ws2, 'Detail Item');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const filename = `laporan_penjualan_${from ?? 'all'}_${to ?? 'all'}.xlsx`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

export default router;
