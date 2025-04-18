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

// 🟢 Track connected users
const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("🟢 A user connected");

    // Join a room using user ID
    socket.on("join", (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.join(userId.toString());
        console.log(`User ${userId} joined room ${userId}`);
    });

    // 📩 Handle message sending
    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
        const created_at = new Date();

        try {
            await db.query(
                "INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?)",
                [senderId, receiverId, message, created_at]
            );

            const payload = { senderId, receiverId, message, created_at };

            // Emit only to receiver if online
            const receiverSocket = onlineUsers.get(receiverId);
            if (receiverSocket) {
                io.to(receiverId.toString()).emit("receiveMessage", payload);
            }

            // Optional: Emit confirmation to sender
            socket.emit("messageSent", payload);
        } catch (err) {
            console.error("Error sending message:", err);
        }
    });

    // 🔴 Handle disconnect
    socket.on("disconnect", () => {
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
