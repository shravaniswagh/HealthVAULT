const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/alerts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching alerts' });
  }
});

// PATCH /api/alerts/read-all — must be before /:id/read to avoid route conflict
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await db.query('UPDATE alerts SET read = true WHERE user_id = $1', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating alerts' });
  }
});

// PATCH /api/alerts/:id/read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM alerts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Alert not found' });

    await db.query('UPDATE alerts SET read = true WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating alert' });
  }
});

module.exports = router;
