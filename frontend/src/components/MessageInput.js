import React, { useState } from "react";
import axios from "axios";

const MessageInput = ({ senderId, receiverId, onNewMessage }) => {
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await axios.post("http://localhost:5000/api/messages", { senderId, receiverId, message });
      onNewMessage({ sender_id: senderId, message });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="message-input-container">
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default MessageInput;