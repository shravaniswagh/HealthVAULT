const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/analytics
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Health score trend: compute score per report date
    const { rows: reports } = await db.query(`
      SELECT id, date FROM reports WHERE user_id = $1 ORDER BY date ASC
    `, [userId]);

    const healthScoreTrend = await Promise.all(reports.map(async report => {
      const { rows: metrics } = await db.query(`
        SELECT status FROM metrics WHERE user_id = $1 AND report_id = $2
      `, [userId, report.id]);

      let score = 100;
      for (const m of metrics) {
        if (m.status === 'critical') score -= 15;
        else if (m.status === 'high' || m.status === 'low') score -= 8;
        else if (m.status === 'borderline') score -= 4;
      }
      score = Math.max(0, Math.min(100, score));

      return { date: report.date, score };
    }));

    // Category scores: average status score per category
    const { rows: categories } = await db.query(`
      SELECT m.category,
        AVG(CASE m.status
          WHEN 'normal' THEN 100
          WHEN 'borderline' THEN 75
          WHEN 'high' THEN 50
          WHEN 'low' THEN 50
          WHEN 'critical' THEN 25
          ELSE 100
        END) as score
      FROM metrics m
      INNER JOIN (
        SELECT name, MAX(recorded_at) as max_date FROM metrics WHERE user_id = $1 GROUP BY name
      ) latest ON m.name = latest.name AND m.recorded_at = latest.max_date
      WHERE m.user_id = $2
      GROUP BY m.category
    `, [userId, userId]);

    const categoryColors = {
      Cardiovascular: '#EF4444',
      Metabolic: '#F59E0B',
      Nutritional: '#8B5CF6',
      Renal: '#3B82F6',
      Thyroid: '#10B981',
      Hematology: '#3B82F6',
      Other: '#6B7280',
    };

    const categoryScores = categories.map(c => ({
      category: c.category,
      score: Math.round(Number(c.score) || 0),
      fill: categoryColors[c.category] || '#6B7280',
    }));

    // Metrics over time (for charts)
    // We get the 5 most frequently recorded metrics to show their trends
    const { rows: topMetrics } = await db.query(`
      SELECT name, COUNT(*) as count 
      FROM metrics WHERE user_id = $1 
      GROUP BY name 
      ORDER BY count DESC LIMIT 15
    `, [userId]);

    const topMetricNames = topMetrics.map(m => m.name);

    let metricsOverTime = [];
    if (topMetricNames.length > 0) {
      const { rows } = await db.query(`
        SELECT name, value, unit, TO_CHAR(recorded_at, 'YYYY-MM-DD') as date, category
        FROM metrics 
        WHERE user_id = $1 AND name = ANY($2)
        ORDER BY recorded_at ASC
      `, [userId, topMetricNames]);
      metricsOverTime = rows;
    }

    // Overall health score (current)
    const { rows: allCurrentMetrics } = await db.query(`
      SELECT m.status FROM metrics m
      INNER JOIN (
        SELECT name, MAX(recorded_at) as max_date FROM metrics WHERE user_id = $1 GROUP BY name
      ) latest ON m.name = latest.name AND m.recorded_at = latest.max_date
      WHERE m.user_id = $2
    `, [userId, userId]);

    let overallScore = 100;
    let statusCounts = { normal: 0, borderline: 0, high: 0, low: 0, critical: 0 };

    for (const m of allCurrentMetrics) {
      if (m.status === 'critical') overallScore -= 15;
      else if (m.status === 'high' || m.status === 'low') overallScore -= 8;
      else if (m.status === 'borderline') overallScore -= 4;

      statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
    }
    overallScore = Math.max(0, Math.min(100, overallScore));

    // Format Status Distribution for PieChart
    const statusDistribution = [
      { name: 'Normal', value: statusCounts.normal, fill: '#10B981' },
      { name: 'Borderline', value: statusCounts.borderline, fill: '#F59E0B' },
      { name: 'High/Low', value: statusCounts.high + statusCounts.low, fill: '#EF4444' },
      { name: 'Critical', value: statusCounts.critical, fill: '#991B1B' }
    ].filter(d => d.value > 0);

    // Summary Stats
    const { rows: totalReportsRow } = await db.query(`SELECT COUNT(id) as count FROM reports WHERE user_id = $1`, [userId]);
    const totalReports = totalReportsRow.length > 0 ? Number(totalReportsRow[0].count) : 0;
    const totalMetricsTracked = allCurrentMetrics.length;

    // Recent Alerts
    const { rows: recentAlerts } = await db.query(`
      SELECT title, severity, created_at FROM alerts 
      WHERE user_id = $1 
      ORDER BY created_at DESC LIMIT 3
    `, [userId]);

    res.json({
      overallScore,
      healthScoreTrend,
      categoryScores,
      metricsOverTime,
      statusDistribution,
      summaryStats: {
        totalReports,
        totalMetricsTracked,
      },
      recentAlerts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

module.exports = router;
