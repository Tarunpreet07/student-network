const db = require('../models/db');

exports.getMessages = (req, res) => {
  db.query('SELECT * FROM messages', (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
};

exports.sendMessage = (req, res) => {
  const { sender_id, receiver_id, message } = req.body;
  db.query('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)', [sender_id, receiver_id, message], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'Message sent' });
  });
};
