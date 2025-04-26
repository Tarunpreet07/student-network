const express = require('express');
const router = express.Router();
const path = require('path');

// Correct the path to db.js inside the config folder
const pool = require(path.join(__dirname, '..', 'config', 'db')); // Adjusted path to point to config/db.js

// ✅ Route path fixed to just "/"
router.get('/', async (req, res) => {
  const { q, type } = req.query;

  if (!q || !type) {
    return res.status(400).json({ message: "Missing search query or type." });
  }

  try {
    let rows = [];

    if (type === 'users') {
      const searchQuery = `%${q.toLowerCase()}%`;
      const [results] = await pool.execute(
        `SELECT id, name, email, branch, year, bio
         FROM users
         WHERE LOWER(name) LIKE ?`,
        [searchQuery]
      );

      rows = results.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        bio: user.bio,
      }));
    }

    // ✅ Handle 'posts' search type
    else if (type === 'posts') {
      const searchQuery = `%${q.toLowerCase()}%`;
      const [results] = await pool.execute(
        `SELECT id, title, content, created_at
         FROM posts
         WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ?`,
        [searchQuery, searchQuery]
      );

      rows = results.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.created_at,
      }));
    }

    // ✅ Handle 'resources' search type
    else if (type === 'resources') {
      const searchQuery = `%${q.toLowerCase()}%`;
      const [results] = await pool.execute(
        `SELECT id, title, subject, tags, downloads, uploaded_at
         FROM resources
         WHERE LOWER(title) LIKE ? OR LOWER(subject) LIKE ? OR LOWER(tags) LIKE ?`,
        [searchQuery, searchQuery, searchQuery]
      );

      rows = results.map(resource => ({
        id: resource.id,
        title: resource.title,
        subject: resource.subject,
        tags: resource.tags,
        downloads: resource.downloads,
        uploadedAt: resource.uploaded_at,
      }));
    }

    // ✅ If no results found
    if (rows.length === 0) {
      return res.status(404).json({ message: `No ${type} found.` });
    }

    // ✅ Send response with results based on the search type
    res.status(200).json({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} found.`,
      table: { rows }
    });

  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({ message: "Search failed.", error: error.message });
  }
});

module.exports = router;
