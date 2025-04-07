const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', (req, res) => {
  db.query('SELECT id, name, email FROM users', (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT id, name, email FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result[0]);
  });
});

// Get all users except the one with the given ID
router.get('/except/:id', (req, res) => {
    const { id } = req.params;
    db.query(
      'SELECT id, name, email FROM users WHERE id != ?',
      [id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result);
      }
    );
  });
  

module.exports = router;
