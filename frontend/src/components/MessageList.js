import React, { useEffect, useState } from "react";
import axios from "axios";

const MessageList = ({ senderId, receiverId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get(http://localhost:5000/api/messages/${senderId}/${receiverId})
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages:", err));
  }, [senderId, receiverId]);

  return (
    <div className="messages-list">
      {messages.map((msg, index) => (
        <div key={index} className={msg.sender_id === senderId ? "message-sent" : "message-received"}>
          {msg.message}
        </div>
      ))}
    </div>
  );
};

export default MessageList;