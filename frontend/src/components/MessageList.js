import React from "react";
import "../styles/messages.css";

const MessageList = ({ messages }) => {
  return (
    <div className="messages-list">
      {messages.map((msg, index) => (
        <div key={index} className={`message-item ${msg.sender === "me" ? "message-sent" : "message-received"}`}>
          <p className="message-sender">{msg.sender}</p>
          <p>{msg.text}</p>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
