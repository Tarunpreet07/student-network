const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Controller
exports.register = async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hash = bcrypt.hashSync(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, password) VALUES (?, ?)',
      [name, hash]
    );

    res.status(201).json({ message: 'User registered!' });
  } catch (err) {
    console.error('❌ Registration Error:', err.message);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Login Controller
exports.login = async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: 'Name and password are required' });
  }

  try {
    const [results] = await db.query(
      'SELECT * FROM users WHERE name = ?',
      [name]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username' });
    }

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });

    res.json({
      message: 'Login success',
      token,
      userId: user.id,
    });
  } catch (err) {
    console.error('❌ Login Error:', err.message);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
