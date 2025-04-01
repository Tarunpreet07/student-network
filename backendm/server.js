const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const routes = require("./routes");

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
        io.emit(`receiveMessage:${receiverId}`, { senderId, receiverId, message, created_at: new Date() });
        io.emit(`receiveMessage:${senderId}`, { senderId, receiverId, message, created_at: new Date() });
    });

    socket.on("disconnect", () => {
        console.log("🔴 A user disconnected");
    });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
