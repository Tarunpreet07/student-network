const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mysql = require("mysql2"); // Assuming you're using mysql2 for async/await support
const routes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use("/api", routes);
app.use("/api/auth", authRoutes);

// MySQL connection setup
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("✅ Connected to MySQL database");
});

// WebSocket connection
io.on("connection", (socket) => {
    console.log("🟢 A user connected");

    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
        const created_at = new Date();
        const payload = { senderId, receiverId, message, created_at };

        // Ensure the message is saved only once by checking the timestamp and sender-receiver combination
        const query = "INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, receiverId, message, created_at], (err, result) => {
            if (err) {
                console.error("❌ Error saving message:", err);
                return;
            }

            console.log("💾 Message saved to DB");

            // Add insertId as the message ID to the payload
            const savedMessage = {
                id: result.insertId,        // ✅ the primary key of the new message
                sender_id: senderId,        // ✅ match what frontend expects
                receiver_id: receiverId,
                message,
                created_at
            };

            // Emit only to the receiver and sender separately to avoid duplication
            io.emit(`receiveMessage:${receiverId}`, savedMessage);
            io.emit(`receiveMessage:${senderId}`, savedMessage);
        });
    });

    socket.on("disconnect", () => {
        console.log("🔴 A user disconnected");
    });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
