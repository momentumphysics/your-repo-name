import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite'; // Bawaan native Node.js v22+

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Inisialisasi Database SQLite Native
const db = new DatabaseSync('app_data.db');

// Buat tabel jika belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS user_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    birthdate TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Endpoint penerima data form
app.post('/api/verify', (req, res) => {
  const { username, latitude, longitude, birthdate } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username wajib diisi.' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO user_verifications (username, latitude, longitude, birthdate)
      VALUES (?, ?, ?, ?)
    `);

    insert.run(
      username,
      latitude !== undefined ? latitude : null,
      longitude !== undefined ? longitude : null,
      birthdate || null
    );

    return res.status(201).json({ success: true, message: 'Data berhasil tersimpan di SQLite.' });
  } catch (err) {
    console.error('Database Error:', err);
    return res.status(500).json({ error: 'Gagal menulis ke database.' });
  }
});

// Endpoint untuk cek data via JSON
app.get('/api/records', (req, res) => {
  const query = db.prepare('SELECT * FROM user_verifications ORDER BY submitted_at DESC');
  res.json(query.all());
});

app.listen(PORT, () => {
  console.log(`Backend aktif di http://localhost:${PORT}`);
});
