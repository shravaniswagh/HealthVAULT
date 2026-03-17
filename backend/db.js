const { Pool } = require('pg');

// Use DATABASE_URL from .env. If not present, warn and fail
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required for PostgreSQL.');
  process.exit(1);
}

const useSSL = process.env.DATABASE_URL.includes('sslmode=require');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        dob DATE,
        address TEXT,
        phone VARCHAR(50),
        blood_type VARCHAR(10),
        gender VARCHAR(50),
        pre_existing_conditions TEXT,
        last_period_date DATE,
        cycle_length INTEGER,
        is_pregnant BOOLEAN DEFAULT FALSE,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        lab VARCHAR(255),
        date DATE,
        type VARCHAR(100),
        notes TEXT,
        file_path TEXT,
        metrics_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        short_name VARCHAR(100),
        value REAL NOT NULL,
        unit VARCHAR(50),
        status VARCHAR(50) DEFAULT 'normal',
        normal_min REAL,
        normal_max REAL,
        category VARCHAR(100),
        color VARCHAR(50),
        description TEXT,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        metric_id INTEGER REFERENCES metrics(id) ON DELETE CASCADE,
        severity VARCHAR(50) NOT NULL DEFAULT 'info',
        title VARCHAR(255) NOT NULL,
        message TEXT,
        recommendation TEXT,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('PostgreSQL database initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  } finally {
    client.release();
  }
}

initDB();

module.exports = pool;
