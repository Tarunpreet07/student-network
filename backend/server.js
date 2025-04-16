const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const routes = require("./routes/messageRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use("/api", routes);

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
    console.log("Connected to MySQL database");
});

// WebSocket connection
io.on("connection", (socket) => {
    console.log("🟢 A user connected");

    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
        const payload = {
            senderId,
            receiverId,
            message,
            created_at: new Date()
        };

        // Save message to MySQL database
        const query = "INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, receiverId, message, payload.created_at], (err, result) => {
            if (err) {
                console.error("Error saving message:", err);
                return;
            }

            console.log("Message saved to DB");

            // Emit message to sender and receiver through WebSocket
            io.emit(`receiveMessage:${receiverId}`, payload);
            io.emit(`receiveMessage:${senderId}`, payload);
        });
    });

    socket.on("disconnect", () => {
        console.log("🔴 A user disconnected");
    });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
