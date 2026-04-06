const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/cycle — get all cycle logs for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM cycle_logs WHERE user_id = $1 ORDER BY period_start DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cycle logs' });
  }
});

// POST /api/cycle — log a new cycle entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      period_start, period_end, cycle_length, flow_level,
      symptoms, mood, pain_level, notes, temperature,
      cervical_mucus, is_ovulation_day
    } = req.body;

    if (!period_start) return res.status(400).json({ error: 'period_start is required' });

    // Update user's last_period_date
    await db.query(
      'UPDATE users SET last_period_date = $1, cycle_length = COALESCE($2, cycle_length) WHERE id = $3',
      [period_start, cycle_length || null, req.user.id]
    );

    const { rows } = await db.query(`
      INSERT INTO cycle_logs (
        user_id, period_start, period_end, cycle_length, flow_level,
        symptoms, mood, pain_level, notes, temperature,
        cervical_mucus, is_ovulation_day
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `, [
      req.user.id, period_start, period_end || null,
      cycle_length || null, flow_level || null,
      symptoms || [], mood || null, pain_level || null,
      notes || null, temperature || null,
      cervical_mucus || null, is_ovulation_day || false
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log cycle entry' });
  }
});

// PATCH /api/cycle/:id — update a cycle log (e.g. add end date)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { period_end, flow_level, symptoms, mood, pain_level, notes, temperature, cervical_mucus } = req.body;
    const { rows } = await db.query(`
      UPDATE cycle_logs SET
        period_end = COALESCE($1, period_end),
        flow_level = COALESCE($2, flow_level),
        symptoms = COALESCE($3, symptoms),
        mood = COALESCE($4, mood),
        pain_level = COALESCE($5, pain_level),
        notes = COALESCE($6, notes),
        temperature = COALESCE($7, temperature),
        cervical_mucus = COALESCE($8, cervical_mucus)
      WHERE id = $9 AND user_id = $10
      RETURNING *
    `, [period_end, flow_level, symptoms, mood, pain_level, notes, temperature, cervical_mucus, req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update cycle log' });
  }
});

// DELETE /api/cycle/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM cycle_logs WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;
