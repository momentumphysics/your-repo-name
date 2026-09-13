const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite Database Connection
const db = new sqlite3.Database(path.resolve(__dirname, 'app_data.db'), (err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to SQLite app_data.db');
  }
});

// Health Check Endpoint (Required by main.js)
app.get('/api/health', (req, res) => {
  res.json({ message: 'Terhubung (Online)' });
});

// Database API Routes Only
app.get('/api/data', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

app.post('/api/data', (req, res) => {
  const { name, email } = req.body;
  db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// Listen on API port
app.listen(PORT, () => {
  console.log(`API/DB Server running on http://localhost:${PORT}`);
});
