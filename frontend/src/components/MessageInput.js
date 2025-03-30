import React, { useState } from "react";
import axios from "axios";
import "../styles/messages.css";

const MessageInput = ({ setMessages }) => {
  const [text, setText] = useState("");

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const response = await axios.post("http://localhost:5000/api/messages", { text, sender: "me" });
      setMessages(prevMessages => [...prevMessages, response.data]);
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="message-input-container">
      <input
        className="message-input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button className="send-button" onClick={sendMessage}>Send</button>
    </div>
  );
};

export default MessageInput;
