const express = require('express');
const router = express.Router();
const db = require('../models/db');  // Your existing MySQL connection
const verifyToken = require('../middleware/auth');  // JWT middleware

// 👥 Get all users
router.get('/', (req, res) => {
  db.query('SELECT id, name, email FROM users', (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// 👤 Get single user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT id, name, email, profile_pic, branch, year, bio FROM users WHERE id = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(result[0]);
    }
  );
});

// 🔍 Get all users except the one with the given ID
router.get('/except/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT id, name, email FROM users WHERE id != ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// 📝 Update profile picture or bio
router.put('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { profile_pic, bio } = req.body;

  // Check if the logged-in user is the one being updated
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  db.query(
    'UPDATE users SET profile_pic = ?, bio = ? WHERE id = ?',
    [profile_pic, bio, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ msg: "Profile updated" });
    }
  );
});

module.exports = router;
