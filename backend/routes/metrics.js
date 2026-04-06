const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { getMetricInsights } = require('../utils/metricInsights');

const { GoogleGenerativeAI } = require('@google/generative-ai');

// GET /api/metrics — latest value per metric name for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get the latest entry per metric name
    const { rows: metrics } = await db.query(`
      SELECT m.*
      FROM metrics m
      INNER JOIN (
        SELECT name, MAX(recorded_at) as max_date
        FROM metrics WHERE user_id = $1
        GROUP BY name
      ) latest ON m.name = latest.name AND m.recorded_at = latest.max_date
      WHERE m.user_id = $2
      ORDER BY m.category, m.name
    `, [req.user.id, req.user.id]);

    // For each metric, also get its history
    const result = await Promise.all(metrics.map(async m => {
      const { rows: history } = await db.query(`
        SELECT value, recorded_at as date
        FROM metrics
        WHERE user_id = $1 AND name = $2
        ORDER BY recorded_at ASC
      `, [req.user.id, m.name]);
      return { ...m, history };
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching metrics' });
  }
});

// GET /api/metrics/:id — full history for a metric
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM metrics WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Metric not found' });
    const metric = rows[0];

    const { rows: history } = await db.query(`
      SELECT value, recorded_at as date
      FROM metrics
      WHERE user_id = $1 AND name = $2
      ORDER BY recorded_at ASC
    `, [req.user.id, metric.name]);

    if (!metric.description) {
      metric.description = getMetricInsights(metric.value, metric.normal_min, metric.normal_max, metric.name);
    }

    res.json({ ...metric, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching metric history' });
  }
});

// GET /api/metrics/:id/insights — generate AI insights for a metric
router.get('/:id/insights', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM metrics WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Metric not found' });
    const metric = rows[0];

    if (!process.env.GEMINI_API_KEY) {
       return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a medical AI assistant for the HealthVault platform. 
The user has a health metric recorded:
- Name: ${metric.name}
- Current Value: ${metric.value} ${metric.unit || ''}
- Normal Range: ${metric.normal_min !== null ? metric.normal_min : 'Unknown'} - ${metric.normal_max !== null ? metric.normal_max : 'Unknown'}
- Status: ${metric.status}

Please explain the following clearly and concisely. Format your response into these exactly matching four sections:

WHAT IT IS:
[Explain what this metric is in simple terms]

WHY IT IS IMPORTANT:
[Explain why this metric matters for overall health]

NORMAL RANGE:
[Explain the normal range, indicating if the user's value is normal, high, or low]

HOW TO IMPROVE IT:
[Provide actionable advice to make this metric better (increase, decrease, or maintain) based explicitly on their current level]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ insight: text });
  } catch (err) {
    console.error('Insights error:', err.message);
    res.status(500).json({ error: 'Failed to generate insight: ' + err.message });
  }
});

// POST /api/metrics — manual metric entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, shortName, value, unit, normalMin, normalMax, category, description } = req.body;
    if (!name || value == null) return res.status(400).json({ error: 'name and value are required' });

    const userId = req.user.id;
    let status = 'normal';
    if (normalMin != null && normalMax != null) {
      if (value < normalMin * 0.8 || value > normalMax * 1.5) status = 'critical';
      else if (value < normalMin) status = 'low';
      else if (value > normalMax * 1.2) status = 'high';
      else if (value > normalMax) status = 'borderline';
    }

    const colorMap = {
      Cardiovascular: '#EF4444',
      Metabolic: '#F59E0B',
      Nutritional: '#8B5CF6',
      Renal: '#3B82F6',
      Thyroid: '#10B981',
      Hematology: '#3B82F6',
      Other: '#6B7280',
    };
    const color = colorMap[category] || '#6B7280';

    const finalDescription = description || getMetricInsights(value, normalMin, normalMax, name);

    const { rows } = await db.query(`
      INSERT INTO metrics (user_id, name, short_name, value, unit, status, normal_min, normal_max, category, color, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [userId, name, shortName || name, value, unit || '', status, normalMin ?? null, normalMax ?? null, category || 'Other', color, finalDescription]);
    
    const newId = rows[0].id;

    // Generate alert if needed
    if (['high', 'critical', 'low'].includes(status)) {
      const severity = status === 'critical' ? 'critical' : status === 'high' ? 'high' : 'medium';
      const dirWord = value < normalMin ? 'low' : 'high';
      await db.query(`
        INSERT INTO alerts (user_id, metric_id, severity, title, message, recommendation)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        userId, newId, severity,
        `Abnormal ${name}`,
        `Your ${name} is ${value} ${unit || ''}, which is ${dirWord}.`,
        `Consider speaking with your doctor about your ${name}.`
      ]);
    }

    res.status(201).json({
      id: newId, name, shortName: shortName || name,
      value, unit, status, normalMin, normalMax, category, color, description
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving manual metric' });
  }
});

module.exports = router;
