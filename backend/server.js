const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const routes = require("./routes/messageRoutes");
const db = require("./config/db");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use("/api", routes);

// WebSocket connection
io.on("connection", (socket) => {
    console.log("🟢 A user connected");

    // 📩 Handle message sending
    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
        const created_at = new Date();

        try {
            // Insert message into the database
            await db.query(
                "INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?)",
                [senderId, receiverId, message, created_at]
            );

            const payload = { senderId, receiverId, message, created_at };

            // Emit the message to both the sender and receiver
            io.emit(`receiveMessage:${receiverId}`, payload); // Receiver
            io.emit(`receiveMessage:${senderId}`, payload); // Sender (if needed)
        } catch (err) {
            console.error("Error sending message:", err);
        }
    });

    // 🔴 Handle disconnect
    socket.on("disconnect", () => {
        console.log("🔴 A user disconnected");
    });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
