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
  const messagesEndRef = useRef(null); // ✅ For auto-scroll

  // Scroll to bottom when new messages come in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get current user details
  useEffect(() => {
    if (user_id) {
      axios
        .get(`http://localhost:5000/api/currentUser/${user_id}`)
        .then((res) => {
          setCurrentUser(res.data);
          socket.emit("join", res.data.id); // join socket room
        })
        .catch((err) => console.error("Error fetching current user:", err));
    }
  }, [user_id]);

  // Get all other users
  useEffect(() => {
    if (user_id) {
      axios
        .get(`http://localhost:5000/api/users/${user_id}`) // returns all users except current
        .then((res) => setUsers(res.data))
        .catch((err) => console.error("Error fetching users:", err));
    }
  }, [user_id]);

  // Load chat messages between current and selected user
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    axios
      .get(
        `http://localhost:5000/api/messages?sender_id=${currentUser.id}&receiver_id=${selectedUser.id}`
      )
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages:", err));
  }, [currentUser, selectedUser]);

  // Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (
        message.sender_id === selectedUser?.id &&
        message.receiver_id === currentUser?.id
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [selectedUser, currentUser]);

  const selectUser = (user) => {
    setSelectedUser(user);
    setMessages([]); // Reset previous messages
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedUser) return;

    const messageData = {
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      message: newMessage,
    };

    try {
      await axios.post("http://localhost:5000/api/messages", messageData);
      socket.emit("sendMessage", messageData); // Notify receiver
      setMessages((prev) => [...prev, { ...messageData, created_at: new Date() }]);
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
                  <div>{msg.message}</div>
                  {msg.created_at && (
                    <small className="timestamp">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </small>
                  )}
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
          <h3>Select a user to start chatting</h3>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
