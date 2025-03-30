const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all users
router.get("/users", async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, username FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
// Get recent chats
router.get("/chats", async (req, res) => {
    try {
      const [chats] = await db.query(
        "SELECT c.id, u.username FROM chats c JOIN users u ON c.userId = u.id"
      );
      res.json(chats);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });
  
  // Get messages for a chat
  router.get("/messages", async (req, res) => {
    const chatId = req.query.chatId;
    try {
      const [messages] = await db.query(
        "SELECT sender, content FROM messages WHERE chatId = ?",
        [chatId]
      );
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });
  
  // Send a new message
  router.post("/messages", async (req, res) => {
    const { chatId, content } = req.body;
    try {
      await db.query("INSERT INTO messages (chatId, sender, content) VALUES (?, ?, ?)", [chatId, "You", content]);
      res.status(200).json({ message: "Message sent" });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });
  