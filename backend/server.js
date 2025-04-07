const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // frontend port
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/users', require('./routes/userRoutes')); // Make sure this route exists
app.use('/api/currentUser', require('./routes/currentUserRoute')); // To fetch current user

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('✅ New client connected');

  // Join user's room by user ID
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`🔗 User ${userId} joined room: user:${userId}`);
  });

  // Relay messages to the receiver's room
  socket.on('sendMessage', (message) => {
    const { receiver_id } = message;
    io.to(`user:${receiver_id}`).emit('receiveMessage', message);
    console.log(`📨 Message sent to user:${receiver_id}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
