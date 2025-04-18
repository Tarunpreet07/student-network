import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import "../styles/messages.css";

const socket = io("http://localhost:5000");

const MessagesPage = () => {
  const { user_id } = useParams();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch all users
  useEffect(() => {
    if (user_id) {
      axios
        .get(`http://localhost:5000/api/users/${user_id}`)
        .then((res) => setUsers(res.data))
        .catch((err) => console.error("Error fetching users:", err));
    }
  }, [user_id]);

  // Fetch current user
  useEffect(() => {
    if (user_id) {
      axios
        .get(`http://localhost:5000/api/currentUser/${user_id}`)
        .then((res) => setCurrentUser(res.data))
        .catch((err) => console.error("Error fetching current user:", err));
    }
  }, [user_id]);

  // Fetch messages between current user and selected user
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    axios
      .get(
        `http://localhost:5000/api/messages/${currentUser.id}/${selectedUser.id}`
      )
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages:", err));
  }, [currentUser, selectedUser]);

  // Socket listener for incoming messages
  useEffect(() => {
    if (!currentUser) return;

    const listener = `receiveMessage:${currentUser.id}`;

    const handleIncoming = (message) => {
      // Normalize if needed
      const normalizedMessage = {
        ...message,
        sender_id: message.sender_id || message.senderId,
      };

      // Only push if it's from someone else
      if (normalizedMessage.sender_id !== currentUser.id) {
        setMessages((prev) => [...prev, normalizedMessage]);
      }
    };

    socket.on(listener, handleIncoming);

    return () => socket.off(listener, handleIncoming);
  }, [currentUser]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectUser = (user) => {
    setSelectedUser(user);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedUser) return;

    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      message: newMessage,
    };

    try {
      // Save to DB
      await axios.post("http://localhost:5000/api/messages", messageData);

      // Emit through socket
      socket.emit("sendMessage", messageData);

      // Show immediately in UI
      setMessages((prev) => [
        ...prev,
        { ...messageData, sender_id: currentUser.id },
      ]);

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="chat-container">
      <div className="user-list">
        <h3>Users</h3>
        {users.map((user) => (
          <div
            key={user.id}
            className={`user ${selectedUser?.id === user.id ? "active" : ""}`}
            onClick={() => selectUser(user)}
          >
            {user.name}
          </div>
        ))}
      </div>

      <div className="chat-box">
        {selectedUser ? (
          <>
            <div className="messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender_id === currentUser?.id ? "sent" : "received"
                  }`}
                >
                  {msg.message}
                </div>
              ))}
              <div ref={messagesEndRef} />
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
