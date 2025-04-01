const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// **User Registration**
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Check if the user already exists
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Store password as plain text (⚠ Not recommended for security reasons)
    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password],
      (err, result) => {
        if (err) {
          console.error("Error during registration:", err);
          return res.status(500).json({ message: "Error registering user" });
        }
        res.status(201).json({ message: "User registered successfully" });
      }
    );
  });
});

// **User Login**
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result[0];

    // Compare passwords (Plain text)
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, userId: user.id });
  });
});

module.exports = router;
