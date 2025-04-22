const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// Get user resources
router.get('/user/:id', async (req, res) => {
  const [resources] = await db.query(`
    SELECT * FROM resources WHERE user_id = ? ORDER BY created_at DESC
  `, [req.params.id]);

  res.json(resources);
});

// Upload resource
router.post('/', verifyToken, async (req, res) => {
  const { title, file_url, subject, tags } = req.body;

  await db.query(`
    INSERT INTO resources (user_id, title, file_url, subject, tags) 
    VALUES (?, ?, ?, ?, ?)
  `, [req.user.id, title, file_url, subject, tags]);

  res.json({ msg: "Resource uploaded" });
});

module.exports = router;
