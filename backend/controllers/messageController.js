const db = require('../models/db');

// Get messages between two users
exports.getMessages = (req, res) => {
  const { sender_id, receiver_id } = req.query;

  if (!sender_id || !receiver_id) {
    return res.status(400).json({ error: 'Sender ID and Receiver ID are required' });
  }

  db.query(
    `SELECT * FROM messages 
     WHERE (sender_id = ? AND receiver_id = ?) 
     OR (sender_id = ? AND receiver_id = ?) 
     ORDER BY created_at ASC`,
    [sender_id, receiver_id, receiver_id, sender_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json(result);
    }
  );
};

// Send a message
exports.sendMessage = (req, res) => {
  const { sender_id, receiver_id, message } = req.body;

  if (!sender_id || !receiver_id || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.query(
    'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
    [sender_id, receiver_id, message],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: 'Message sent' });
    }
  );
};

// Get messages between two specific users using params
exports.getMessagesBetweenUsers = (req, res) => {
  const { senderId, receiverId } = req.params;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'Sender ID and Receiver ID are required' });
  }

  db.query(
    `SELECT * FROM messages 
     WHERE (sender_id = ? AND receiver_id = ?) 
        OR (sender_id = ? AND receiver_id = ?) 
     ORDER BY created_at ASC`,
    [senderId, receiverId, receiverId, senderId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json(result);
    }
  );
};
