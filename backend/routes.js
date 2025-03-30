const express = require("express");
const router = express.Router();
const db = require("./db");

// ✅ Get all users
router.get("/users", async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, name, profile_pic FROM users");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get all users except the logged-in user
router.get("/users/:userId", async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, name, profile_pic FROM users WHERE id != ?", [req.params.userId]);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get chat messages between two users
router.get("/messages/:senderId/:receiverId", async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const [messages] = await db.query(`
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) 
            ORDER BY created_at ASC`, 
            [senderId, receiverId, receiverId, senderId]
        );

        // ✅ Mark messages as read
        await db.query("UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE", [receiverId, senderId]);

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Send a new message
router.post("/messages", async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;
        await db.query("INSERT INTO messages (sender_id, receiver_id, message, is_read) VALUES (?, ?, ?, FALSE)", [senderId, receiverId, message]);
        res.json({ message: "Message sent successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get unread message count
router.get("/unread-messages/:userId", async (req, res) => {
    try {
        const [unread] = await db.query(`
            SELECT sender_id, COUNT(*) as unread_count 
            FROM messages 
            WHERE receiver_id = ? AND is_read = FALSE 
            GROUP BY sender_id`, 
            [req.params.userId]
        );
        res.json(unread);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
