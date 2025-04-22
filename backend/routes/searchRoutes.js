const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your DB connection setup

// -------------------- Search Users --------------------
router.get('/users', (req, res) => {
  const { name, year, branch, bio } = req.query;

  let query = 'SELECT id, name, email, branch, year, bio FROM users WHERE 1=1';
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
  if (bio) {
    query += ' AND bio LIKE ?';
    params.push(`%${bio}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const headers = ["ID", "Name", "Email", "Branch", "Year", "Bio"];
    const rows = results.map(user => [
      user.id, user.name, user.email, user.branch, user.year, user.bio
    ]);

    res.json({ table: { headers, rows } });
  });
});

// -------------------- Search Resources (Notes) --------------------
router.get('/resources', (req, res) => {
  const { title, subject, tags } = req.query;

  let query = 'SELECT id, title, subject, tags, downloads, uploaded_at FROM resources WHERE 1=1';
  let params = [];

  if (title) {
    query += ' AND title LIKE ?';
    params.push(`%${title}%`);
  }
  if (subject) {
    query += ' AND subject LIKE ?';
    params.push(`%${subject}%`);
  }
  if (tags) {
    query += ' AND tags LIKE ?';
    params.push(`%${tags}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const headers = ["ID", "Title", "Subject", "Tags", "Downloads", "Uploaded At"];
    const rows = results.map(note => [
      note.id, note.title, note.subject, note.tags, note.downloads, note.uploaded_at
    ]);

    res.json({ table: { headers, rows } });
  });
});

// -------------------- Search Posts --------------------
router.get('/posts', (req, res) => {
  const { title, content } = req.query;

  let query = 'SELECT id, title, content, created_at FROM posts WHERE 1=1';
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
    if (err) return res.status(500).json({ error: err.message });

    const headers = ["ID", "Title", "Content", "Created At"];
    const rows = results.map(post => [
      post.id, post.title, post.content, post.created_at
    ]);

    res.json({ table: { headers, rows } });
  });
});

module.exports = router;
