import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    if (user_id) {
      axios
        .get(`http://localhost:5000/api/users/${user_id}`)
        .then((res) => setUsers(res.data))
        .catch((err) => console.error("Error fetching users:", err));
    }
  }, [user_id]);

  useEffect(() => {
    if (user_id) {
      axios
        .get(`http://localhost:5000/api/currentUser/${user_id}`)
        .then((res) => setCurrentUser(res.data))
        .catch((err) => console.error("Error fetching current user:", err));
    }
  }, [user_id]);

  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    axios
      .get(
        `http://localhost:5000/api/messages/${currentUser.id}/${selectedUser.id}`
      )
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages:", err));
  }, [currentUser, selectedUser]);

  useEffect(() => {
    if (!currentUser) return;

    const listener = `receiveMessage:${currentUser.id}`;
    socket.on(listener, (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => socket.off(listener);
  }, [currentUser]);

  const selectUser = (user) => {
    setSelectedUser(user);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedUser) return;

    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      message: newMessage,
    };

    try {
      await axios.post("http://localhost:5000/api/messages", messageData);
      socket.emit("sendMessage", messageData);

      // Add the message immediately to the chat
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
            <h3>Chat with {selectedUser.name}</h3>
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
