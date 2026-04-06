require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/alerts', require('./routes/alerts'));
<<<<<<< HEAD
=======
app.use('/api/cycle', require('./routes/cycle'));
>>>>>>> f346220b8367c7f770d8d6b55a1e314826d9ffdf

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

<<<<<<< HEAD
=======
// Serve frontend in production/Docker
const staticDistPath = path.join(__dirname, '../dist');
if (fs.existsSync(staticDistPath)) {
  app.use(express.static(staticDistPath));
  // Catch-all route to serve React's index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDistPath, 'index.html'));
  });
}

>>>>>>> f346220b8367c7f770d8d6b55a1e314826d9ffdf
app.listen(PORT, () => {
  console.log(`HealthVault backend running on http://localhost:${PORT}`);
});
