const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ Get all users except the logged-in user
router.get("/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const [users] = await db.query("SELECT id, name FROM users WHERE id != ?", [userId]);
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Get current user
router.get("/currentUser/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const [user] = await db.query("SELECT id, name FROM users WHERE id = ?", [userId]);

        if (!user.length) return res.status(404).json({ error: "User not found" });

        res.json(user[0]);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Get chat messages
router.get("/messages/:senderId/:receiverId", async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const [messages] = await db.query(`
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) 
            ORDER BY created_at ASC
        `, [senderId, receiverId, receiverId, senderId]);

        res.json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Send a new message
router.post("/messages", async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;

        if (!senderId || !receiverId || !message.trim()) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        await db.query("INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)", [senderId, receiverId, message]);
        res.json({ message: "Message sent successfully!" });
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;