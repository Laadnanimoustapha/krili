const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

console.log("DB_USER =", process.env.DB_USER);
console.log("DB_PASSWORD =", process.env.DB_PASSWORD);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'CALL register_user(?, ?, ?, ?, ?)',
    [email, hashedPassword, firstName, lastName, ''],
    (err, result) => {
      if (err) return res.status(500).json({ status: 'error', message: 'Server error' });
      const response = result[0][0];
      if (response.status === 'error') return res.status(400).json(response);
      res.json({ status: 'success', user_id: response.user_id });
    }
  );
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?', [user.user_id]);
    res.json({ message: 'Login successful', user: { id: user.user_id, email: user.email } });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
// already add to glitch
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});


