const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, gender, age } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    let dobDate = null;
    if (age) {
       const d = new Date();
       d.setFullYear(d.getFullYear() - parseInt(age));
       dobDate = d.toISOString().split('T')[0];
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, gender, dob) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, hash, gender || 'prefer_not_to_say', dobDate]
    );
    
    const user = { id: result.rows[0].id, name, email, gender: gender || 'prefer_not_to_say' };
    const token = jwt.sign(user, process.env.JWT_SECRET || 'healthvault_secret', { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const row = rows[0];
    const valid = bcrypt.compareSync(password, row.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const user = { id: row.id, name: row.name, email: row.email, gender: row.gender };
    const token = jwt.sign(user, process.env.JWT_SECRET || 'healthvault_secret', { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, dob, address, phone, blood_type, gender, pre_existing_conditions, last_period_date, cycle_length, is_pregnant, due_date, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching user' });
  }
});

// PUT /api/auth/me
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { 
      dob, address, phone, blood_type, gender, pre_existing_conditions, 
      last_period_date, cycle_length, is_pregnant, due_date 
    } = req.body;

    await db.query(
      `UPDATE users 
       SET dob = $1, address = $2, phone = $3, blood_type = $4, gender = $5, 
           pre_existing_conditions = $6, last_period_date = $7, cycle_length = $8, 
           is_pregnant = $9, due_date = $10
       WHERE id = $11`,
      [
        dob || null, address || null, phone || null, blood_type || null, gender || null,
        pre_existing_conditions || null, last_period_date || null, cycle_length || null,
        is_pregnant || false, due_date || null, req.user.id
      ]
    );

    const { rows } = await db.query(
      'SELECT id, name, email, dob, address, phone, blood_type, gender, pre_existing_conditions, last_period_date, cycle_length, is_pregnant, due_date, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating user profile' });
  }
});

module.exports = router;
