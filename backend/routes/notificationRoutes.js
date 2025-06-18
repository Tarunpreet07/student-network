const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/:userId", notificationController.getNotifications);
router.put("/markAsRead/:notificationId", notificationController.markAsRead);
router.post("/", notificationController.createNotification);

module.exports = router;
