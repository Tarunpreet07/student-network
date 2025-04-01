const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
  } else {
    console.log('Connected to MySQL');
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the backend API!');
});

// Example Route for Posts
app.get('/api/posts', (req, res) => {
  db.query('SELECT * FROM posts', (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching posts' });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
