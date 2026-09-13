const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Sajikan folder "public" sebagai file statis
app.use(express.static(path.join(__dirname, 'public')));

// 3. Inisialisasi Database SQLite
const db = new sqlite3.Database(path.join(__dirname, 'app_data.db'), (err) => {
  if (err) {
    console.error('Koneksi Database Gagal:', err.message);
  } else {
    console.log('Terhubung ke database SQLite.');
  }
});

// 4. API Endpoints (Gunakan prefix /api/)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend aktif dan terhubung' });
});

// Contoh Endpoint Ambil Data
app.get('/api/data', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 5. Routing Halaman Utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 6. Jalankan Server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
