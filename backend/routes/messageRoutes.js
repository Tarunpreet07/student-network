const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  getMessagesBetweenUsers, // ✅ Add this
} = require('../controllers/messageController');

router.get('/', getMessages);
router.post('/', sendMessage);

// ✅ Add this new route:
router.get('/:senderId/:receiverId', getMessagesBetweenUsers);

module.exports = router;
