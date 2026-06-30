const router = require('express').Router();
const pool   = require('../db/pool');

const PERIODS = {
  today:   { sql: `created_at >= date_trunc('day', NOW())`,           chart: { trunc: 'hour',  fmt: 'HH24:00' } },
  week:    { sql: `created_at >= date_trunc('week', NOW())`,          chart: { trunc: 'day',   fmt: 'DD Mon'  } },
  month:   { sql: `created_at >= date_trunc('month', NOW())`,         chart: { trunc: 'day',   fmt: 'DD Mon'  } },
  quarter: { sql: `created_at >= NOW() - interval '3 months'`,        chart: { trunc: 'week',  fmt: 'DD Mon'  } },
  year:    { sql: `created_at >= date_trunc('year', NOW())`,          chart: { trunc: 'month', fmt: 'Mon YY'  } },
  all:     { sql: null,                                                chart: { trunc: 'month', fmt: 'Mon YY'  } },
};

router.get('/', async (req, res) => {
  try {
    const p = PERIODS[req.query.period] || PERIODS.all;
    const WHERE  = p.sql ? `WHERE ${p.sql}`  : '';
    const AND    = p.sql ? `AND ${p.sql}`    : '';
    const { trunc, fmt } = p.chart;

    const [
      orderStats,
      revenueChart,
      statusBreakdown,
      productStats,
      recentOrders,
      topCities,
    ] = await Promise.all([

      pool.query(`
        SELECT
          COUNT(*)                                                                         AS total_orders,
          COUNT(*) FILTER (WHERE paid = true OR status = 'Delivered')                     AS paid_orders,
          COUNT(*) FILTER (WHERE paid = false AND status NOT IN ('Delivered','Returned'))  AS unpaid_orders,
          COALESCE(SUM(total), 0)                                                          AS total_revenue,
          COALESCE(SUM(total) FILTER (WHERE paid = true OR status = 'Delivered'), 0)       AS paid_revenue,
          COALESCE(AVG(total), 0)                                                          AS avg_order_value,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()))                 AS orders_this_month,
          COALESCE(SUM(total) FILTER (WHERE created_at >= date_trunc('month', NOW())), 0)  AS revenue_this_month,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW() - interval '1 month')
                             AND  created_at  < date_trunc('month', NOW()))                AS orders_last_month,
          COALESCE(SUM(total) FILTER (WHERE created_at >= date_trunc('month', NOW() - interval '1 month')
                                       AND  created_at  < date_trunc('month', NOW())), 0)  AS revenue_last_month
        FROM orders
        ${WHERE}
      `),

      pool.query(`
        SELECT
          to_char(date_trunc('${trunc}', created_at), '${fmt}') AS month,
          date_trunc('${trunc}', created_at)                     AS month_date,
          COUNT(*)                                               AS orders,
          COALESCE(SUM(total), 0)                               AS revenue
        FROM orders
        ${WHERE}
        GROUP BY date_trunc('${trunc}', created_at)
        ORDER BY month_date ASC
      `),

      pool.query(`
        SELECT status, COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue
        FROM orders
        ${WHERE}
        GROUP BY status
        ORDER BY count DESC
      `),

      pool.query(`
        SELECT
          COUNT(*)                                                      AS total_products,
          COUNT(*) FILTER (WHERE stock_quantity = 0)                    AS out_of_stock,
          COUNT(*) FILTER (WHERE stock_quantity > 0 AND stock_quantity <= 5) AS low_stock,
          COUNT(*) FILTER (WHERE on_promotion = true)                   AS on_promotion,
          COUNT(*) FILTER (WHERE is_new = true)                         AS is_new,
          COUNT(*) FILTER (WHERE hidden = true)                         AS hidden
        FROM products
      `),

      pool.query(`
        SELECT id, order_number, customer_name, total, status, paid, created_at, delivery_city
        FROM orders
        ${WHERE}
        ORDER BY created_at DESC
        LIMIT 10
      `),

      pool.query(`
        SELECT
          COALESCE(delivery_city, billing_city, 'Unknown') AS city,
          COUNT(*) AS orders,
          COALESCE(SUM(total), 0) AS revenue
        FROM orders
        ${WHERE ? WHERE + ' AND' : 'WHERE'} COALESCE(delivery_city, billing_city) IS NOT NULL
        GROUP BY COALESCE(delivery_city, billing_city, 'Unknown')
        ORDER BY orders DESC
        LIMIT 5
      `),
    ]);

    res.json({
      orders:          orderStats.rows[0],
      revenueByMonth:  revenueChart.rows,
      statusBreakdown: statusBreakdown.rows,
      products:        productStats.rows[0],
      recentOrders:    recentOrders.rows,
      topCities:       topCities.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
