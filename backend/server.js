const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const multer = require("multer"); // For file uploads

const routes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");
const searchRoutes = require("./routes/searchRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use("/api", routes);
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Set up MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err);
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

    const query = "INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?)";

    db.query(query, [senderId, receiverId, message, created_at], (err, result) => {
      if (err) {
        console.error("❌ Error saving message:", err);
        return;
      }

      console.log("💾 Message saved to DB");

      const savedMessage = {
        id: result.insertId,
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        created_at
      };

      // Emit to both sender and receiver
      io.emit(`receiveMessage:${receiverId}`, savedMessage);
      io.emit(`receiveMessage:${senderId}`, savedMessage);
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });
});

// Route to get user profile
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT id, name, email, profile_pic, bio FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ error: "User not found" });

    if (result[0].profile_pic) {
      result[0].profile_pic = `http://localhost:5000${result[0].profile_pic}`;
    }

    res.json(result[0]);
  });
});

// Route to update user profile
app.put("/api/users/:id", multer().single('profile_pic'), (req, res) => {
  const { id } = req.params;
  const bio = req.body.bio;
  let profile_pic = req.file ? `/uploads/${req.file.filename}` : null;

  db.query(
    "UPDATE users SET profile_pic = ?, bio = ? WHERE id = ?",
    [profile_pic, bio, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      db.query("SELECT id, name, email, profile_pic, bio FROM users WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.length === 0) return res.status(404).json({ error: "User not found" });

        if (result[0].profile_pic) {
          result[0].profile_pic = `http://localhost:5000${result[0].profile_pic}`;
        }

        res.json(result[0]);
      });
    }
  );
});

// Route to create a post with image and PDF upload
app.post("/api/posts/:userId", multer().fields([{ name: 'image' }, { name: 'pdf' }]), (req, res) => {
  const { userId } = req.params;
  const { text } = req.body;
  const imageFile = req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : null;
  const pdfFile = req.files['pdf'] ? `/uploads/${req.files['pdf'][0].filename}` : null;

  const created_at = new Date();

  const query = "INSERT INTO posts (user_id, text, image, pdf, created_at) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [userId, text, imageFile, pdfFile, created_at], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to add post" });
    }
    res.status(201).json({ message: "Post added successfully", postId: result.insertId });
  });
});

// Start the server
server.listen(5000, () => console.log("🚀 Server running on port 5000"));
