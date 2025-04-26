const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const multer = require("multer"); // For file uploads
const path = require("path");
const fs = require("fs");

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

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

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

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = Date.now() + '.' + fileExtension;
    cb(null, fileName);
  }
});
const upload = multer({ storage: storage });

// Route to get user profile
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT id, name, email, profile_pic, bio FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ error: "User not found" });

    // Check if profile_pic exists and modify the path accordingly
    if (result[0].profile_pic) {
      result[0].profile_pic = `/uploads/${result[0].profile_pic}`;
    } else {
      result[0].profile_pic = '/uploads/default-profile-pic.png'; // Default profile pic if not set
    }

    res.json(result[0]);
  });
});

// Route to get full profile data
app.get("/api/users/:id/profile", (req, res) => {
  const { id } = req.params;
  db.query("SELECT id, name, email, profile_pic, bio FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: "User not found" });

    const user = result[0];

    // If profile_pic exists in the database, return its path
    if (user.profile_pic) {
      user.profile_pic = `/uploads/${user.profile_pic}`;
    }

    res.json(user);
  });
});

// Route to update user profile
app.put("/api/users/:id", upload.single('profile_pic'), (req, res) => {
  const { id } = req.params;
  const bio = req.body.bio;
  let profile_pic = req.file ? req.file.filename : null; // Only store the filename, not the full path

  // Only update profile_pic if a new one is provided, otherwise keep it as it is
  const query = "UPDATE users SET profile_pic = COALESCE(?, profile_pic), bio = ? WHERE id = ?";
  db.query(query, [profile_pic, bio, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    // Return the updated profile with the correct path for profile_pic
    db.query("SELECT id, name, email, profile_pic, bio FROM users WHERE id = ?", [id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.length === 0) return res.status(404).json({ error: "User not found" });

      const updatedUser = result[0];

      // Send the profile data exactly as it is, no default image handling
      res.json(updatedUser);
    });
  });
});
app.post("/api/posts", upload.single('image'), (req, res) => {
  const { user_id, content } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!user_id || !content) return res.status(400).json({ error: "Missing fields" });

  db.query(
    "INSERT INTO posts (user_id, content, created_at, image) VALUES (?, ?, NOW(), ?)",
    [user_id, content, image],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Post added successfully", postId: result.insertId });
    }
  );
});

// Backend Route to get posts by user
app.get("/api/posts/:userId", (req, res) => {
  const { userId } = req.params;

  // Query to get posts for the user
  const query = "SELECT * FROM posts WHERE user_id = ?";
  
  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch posts" });
    }
    res.status(200).json(result); // Return posts data
  });
});

app.post("/api/resources", upload.single('file'), (req, res) => {
  const { user_id, title, subject, tags } = req.body;
  const file_url = req.file ? req.file.filename : null;

  // Check for required fields
  if (!user_id || !title || !file_url) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Insert into database
  db.query(
    "INSERT INTO resources (user_id, title, file_url, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
    [user_id, title, file_url, subject, tags],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Resource uploaded successfully", resourceId: result.insertId });
    }
  );
});



app.get("/api/resources/:userId", (req, res) => {
  const { userId } = req.params;
  db.query("SELECT id, title, file_url, created_at FROM resources WHERE user_id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});



// **Updated route to search users by name**
app.get("/api/search", (req, res) => {
  const { q } = req.query;  // Get the query parameter 'q'

  if (!q) {
    return res.status(400).json({ message: "Search query is required" });
  }

  // Query the database for users whose name matches the search term
  const query = "SELECT id, name, email, profile_pic, bio FROM users WHERE name LIKE ?";

  db.query(query, [`%${q}%`], (err, result) => {
    if (err) {
      console.error("Error searching users:", err);
      return res.status(500).json({ message: "Error searching users" });
    }

    // If users are found, return them
    if (result.length > 0) {
      result.forEach(user => {
        if (user.profile_pic) {
          user.profile_pic = `/uploads/${user.profile_pic}`;
        } else {
          user.profile_pic = '/uploads/default-profile-pic.png'; // Default profile pic
        }
      });
      
      return res.json({
        message: "Users found",
        users: result // Return the list of matching users
      });
    }

    // If no users found, return a message with an empty list
    return res.json({
      message: "No users found",
      users: [] // Return an empty array if no users match the search term
    });
  });
});

// Start the server
server.listen(5000, () => console.log("🚀 Server running on port 5000"));
