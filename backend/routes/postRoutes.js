const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// Get user posts
router.get('/user/:id', async (req, res) => {
  const [posts] = await db.query(`
    SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC
  `, [req.params.id]);

  res.json(posts);
});

// Add new post
router.post('/', verifyToken, async (req, res) => {
  const { content } = req.body;
  await db.query(`
    INSERT INTO posts (user_id, content) VALUES (?, ?)
  `, [req.user.id, content]);

  res.json({ msg: "Post added" });
});

module.exports = router;
