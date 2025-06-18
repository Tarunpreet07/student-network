const db = require("../config/db");

// Fetch notifications for a user
exports.getNotifications = (req, res) => {
    const { userId } = req.params;
    console.log("Fetching notifications for user:", userId); // ✅ Add this
  
    const query = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
  
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("❌ Error fetching notifications:", err); // ✅ Add this
        return res.status(500).json({ error: "Failed to fetch notifications" });
      }
      console.log("✅ Notifications fetched:", results.length); // ✅ Add this
      res.status(200).json(results);
    });
  };
  

// Mark a notification as read
exports.markAsRead = (req, res) => {
  const { notificationId } = req.params;
  const query = "UPDATE notifications SET is_read = 1 WHERE id = ?";

  db.query(query, [notificationId], (err) => {
    if (err) return res.status(500).json({ error: "Failed to update notification" });
    res.status(200).json({ success: true });
  });
};

// Create a new notification
exports.createNotification = (req, res) => {
  const { user_id, message } = req.body;

  if (!user_id || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = "INSERT INTO notifications (user_id, message, is_read, created_at) VALUES (?, ?, false, NOW())";
  db.query(query, [user_id, message], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to create notification" });
    res.status(201).json({ success: true, notificationId: result.insertId });
  });
};
