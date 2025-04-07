const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const routes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use("/api", routes);

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

        // ✅ Use backticks `` for template literals
        io.emit(`receiveMessage:${receiverId}`, payload);
        io.emit(`receiveMessage:${senderId}`, payload);
    });

    socket.on("disconnect", () => {
        console.log("🔴 A user disconnected");
    });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
