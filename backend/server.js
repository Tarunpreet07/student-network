const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Connect to MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "tarun@1924",  // Replace with your actual password
    database: "campus_network",
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL");
    }
});

// Fetch users
app.get("/users", (req, res) => {
    db.query("SELECT id, name FROM users", (err, result) => {
        if (err) {
            console.error("Error fetching users:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Users fetched:", result); // Debugging line
        res.json(result);
    });
});


// Mock current user
app.get("/currentUser", (req, res) => {
    res.json({ id: 1, username: "Alice" });
});

// Fetch messages between two users (Fixed timestamp issue)
app.get("/messages/:senderId/:receiverId", (req, res) => {
    const { senderId, receiverId } = req.params;
    const query = `
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) 
        OR (sender_id = ? AND receiver_id = ?) 
        ORDER BY created_at ASC
    `;
    db.query(query, [senderId, receiverId, receiverId, senderId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Handle WebSocket connection
io.on("connection", (socket) => {
    console.log("🟢 A user connected");

    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
        const query = "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)";
        db.query(query, [senderId, receiverId, message], (err, result) => {
            if (err) {
                console.error("❌ Error sending message:", err.message);
            } else {
                io.emit("receiveMessage", { senderId, receiverId, message, created_at: new Date() });
            }
        });
    });

    socket.on("disconnect", () => {
        console.log("🔴 A user disconnected");
    });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
