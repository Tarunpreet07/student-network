const express = require('express');
const router = express.Router();
const db = require('../config/db'); // or use your existing db connection

// Search users
router.get('/users', (req, res) => {
  const { name, year, branch } = req.query;
  let query = 'SELECT * FROM users WHERE 1=1';
  let params = [];

  if (name) {
    query += ' AND name LIKE ?';
    params.push(`%${name}%`);
  }
  if (year) {
    query += ' AND year = ?';
    params.push(year);
  }
  if (branch) {
    query += ' AND branch = ?';
    params.push(branch);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Search notes
router.get('/notes', (req, res) => {
  const { subject, semester } = req.query;
  let query = 'SELECT * FROM notes WHERE 1=1';
  let params = [];

  if (subject) {
    query += ' AND subject LIKE ?';
    params.push(`%${subject}%`);
  }
  if (semester) {
    query += ' AND semester = ?';
    params.push(semester);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Search posts
router.get('/posts', (req, res) => {
  const { title, content } = req.query;
  let query = 'SELECT * FROM posts WHERE 1=1';
  let params = [];

  if (title) {
    query += ' AND title LIKE ?';
    params.push(`%${title}%`);
  }
  if (content) {
    query += ' AND content LIKE ?';
    params.push(`%${content}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

module.exports = router;
