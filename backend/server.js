// File remains mostly the same, but I'll highlight the changes

// Add necessary imports
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Load routes
const routes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");
const searchRoutes = require("./routes/searchRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use("/api", routes);
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Error:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database");
});

// WebSocket
io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const created_at = new Date();
    const query = "INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?)";
    
    db.query(query, [senderId, receiverId, message, created_at], (err, result) => {
      if (err) {
        console.error("❌ Error saving message:", err);
        return;
      }

      const savedMessage = {
        id: result.insertId,
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        created_at
      };

      io.emit(`receiveMessage:${receiverId}`, savedMessage);
      io.emit(`receiveMessage:${senderId}`, savedMessage);
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });
});

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// --- API Endpoints ---

// Fetch user profile
app.get("/api/users/:id/profile", (req, res) => {
  const { id } = req.params;
  db.query("SELECT id, name, email, profile_pic, bio FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: "User not found" });

    const user = result[0];
    user.profile_pic = user.profile_pic ? `/uploads/${user.profile_pic}` : '/uploads/default-profile-pic.png';

    res.json(user);
  });
});

// Update user profile
app.put("/api/users/:id", upload.single('profile_pic'), (req, res) => {
  const { id } = req.params;
  const bio = req.body.bio;
  const profile_pic = req.file ? req.file.filename : null;

  const query = "UPDATE users SET profile_pic = COALESCE(?, profile_pic), bio = ? WHERE id = ?";
  db.query(query, [profile_pic, bio, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query("SELECT id, name, email, profile_pic, bio FROM users WHERE id = ?", [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.status(404).json({ error: "User not found" });

      const updatedUser = result[0];
      updatedUser.profile_pic = updatedUser.profile_pic ? `/uploads/${updatedUser.profile_pic}` : '/uploads/default-profile-pic.png';
      res.json(updatedUser);
    });
  });
});

// Create new post
app.post('/api/posts', upload.single('image'), (req, res) => {
  const { userId, content } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!userId || !content) {
    return res.status(400).json({ message: 'userId and content are required' });
  }

  const query = "INSERT INTO posts (user_id, content, image_url, created_at) VALUES (?, ?, ?, NOW())";
  db.query(query, [userId, content, image], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    const post = { id: result.insertId, user_id: userId, content, image_url: image };
    res.status(201).json(post);
  });
});

// Fetch posts
app.get("/api/posts/:userId", (req, res) => {
  const { userId } = req.params;

  db.query("SELECT * FROM posts WHERE user_id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to fetch posts" });

    const posts = result.map(post => {
      post.image_url = post.image_url ? `/uploads/${post.image_url}` : null;
      return post;
    });

    res.status(200).json(posts);
  });
});

// Upload resource
app.post("/api/resources", upload.single('file'), (req, res) => {
  const { user_id, title, subject, tags } = req.body;
  const file_url = req.file ? req.file.filename : null;

  if (!user_id || !title || !file_url) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = "INSERT INTO resources (user_id, title, subject, tags, file_url, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
  db.query(query, [user_id, title, subject, tags, file_url], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Resource uploaded successfully", resourceId: result.insertId });
  });
});

// Fetch resources
app.get("/api/resources/:userId", (req, res) => {
  const { userId } = req.params;

  db.query("SELECT id, title, file_url, created_at FROM resources WHERE user_id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const resources = result.map(resource => ({
      ...resource,
      file_url: `/uploads/${resource.file_url}`
    }));

    res.json(resources);
  });
});

// Search users
app.get("/api/search", (req, res) => {
  const { q } = req.query;

  if (!q) return res.status(400).json({ message: "Search query is required" });

  db.query("SELECT id, name, email, profile_pic, bio FROM users WHERE name LIKE ?", [`%${q}%`], (err, result) => {
    if (err) return res.status(500).json({ message: "Error searching users" });

    result.forEach(user => {
      user.profile_pic = user.profile_pic ? `/uploads/${user.profile_pic}` : '/uploads/default-profile-pic.png';
    });

    res.json({ message: result.length ? "Users found" : "No users found", users: result });
  });
});

// Start Server
server.listen(5000, () => console.log("🚀 Server running on port 5000"));
