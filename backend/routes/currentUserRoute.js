const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT id, name, email FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result[0]);
  });
});

module.exports = router;
