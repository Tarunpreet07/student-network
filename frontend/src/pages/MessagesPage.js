import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import "../styles/messages.css";

const socket = io("http://localhost:5000");

const MessagesPage = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/users")
      .then((res) => {
        console.log("Users fetched:", res.data);
        setUsers(res.data);
      })
      .catch((err) => console.error("Error fetching users:", err));

    axios
      .get("http://localhost:5000/currentUser")
      .then((res) => {
        console.log("Current user fetched:", res.data);
        setCurrentUser(res.data);
      })
      .catch((err) => console.error("Error fetching current user:", err));
  }, []);

  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    axios
      .get(`http://localhost:5000/messages/${currentUser.id}/${selectedUser.id}`)
      .then((res) => {
        console.log(`Messages with ${selectedUser.name}:`, res.data);
        setMessages(res.data);
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [currentUser, selectedUser]);

  const selectUser = (user) => {
    setSelectedUser(user);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentUser || !selectedUser) return;

    const message = {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      message: newMessage,
    };

    socket.emit("sendMessage", message);
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <div className="user-list">
        <h3>Users</h3>
        {console.log("🚀 Rendering Users:", users)}
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className={`user ${selectedUser?.id === user.id ? "active" : ""}`}
              onClick={() => selectUser(user)}
            >
              {user.name}
            </div>
          ))
        ) : (
          <p>No users available</p>
        )}
      </div>

      <div className="chat-box">
        {selectedUser ? (
          <>
            <h3>Chat with {selectedUser.name}</h3>
            <div className="messages">
              {messages.map((msg, index) => (
                <div key={index} className={msg.senderId === currentUser?.id ? "message-sent" : "message-received"}>
                  {msg.message}
                </div>
              ))}
            </div>
            <div className="input-box">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <h3>Select a user to chat</h3>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
