const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const multer = require("multer"); // Import multer for file uploads
const routes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend to access the backend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use("/api", routes);
app.use("/api/auth", authRoutes);

// Serve static files (e.g., images) from the 'uploads' directory
app.use('/uploads', express.static('uploads'));  // Important for serving profile images

// Set up MySQL connection
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
        
        // Construct the full URL for the profile pic
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

    // If there's a new profile pic uploaded, we save it to the uploads folder
    let profile_pic = req.file ? req.file.path : null;

    if (profile_pic) {
        // When there's a new profile pic, store the relative path (ensure it's the correct path for static serving)
        profile_pic = `/uploads/${req.file.filename}`;
    }

    // Update the user's profile with new bio and profile picture URL (if available)
    db.query(
        "UPDATE users SET profile_pic = ?, bio = ? WHERE id = ?",
        [profile_pic, bio, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            // After update, get the updated profile with the full URL for profile picture
            db.query("SELECT id, name, email, profile_pic, bio FROM users WHERE id = ?", [id], (err, result) => {
                if (err) return res.status(500).json({ error: err });
                if (result.length === 0) return res.status(404).json({ error: "User not found" });

                // Construct the full URL for the profile pic
                if (result[0].profile_pic) {
                    result[0].profile_pic = `http://localhost:5000${result[0].profile_pic}`;
                }

                res.json(result[0]); // Send back the updated profile info
            });
        }
    );
});

// Route to create a post with image and PDF upload
app.post("/api/posts/:userId", multer().fields([{ name: 'image' }, { name: 'pdf' }]), (req, res) => {
    const { userId } = req.params;
    const { text } = req.body; // Post text from the frontend
    const imageFile = req.files['image'] ? req.files['image'][0].path : null; // Image file path
    const pdfFile = req.files['pdf'] ? req.files['pdf'][0].path : null; // PDF file path

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
