import React, { useEffect, useState, useRef } from "react";
import { useParams , Link} from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import "../styles/messages.css";

const socket = io("http://localhost:5000");

const MessagesPage = () => {
  const { user_id } = useParams();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
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

  // Fetch unread message counts
  useEffect(() => {
    if (currentUser) {
      axios
        .get(`http://localhost:5000/api/unread/${currentUser.id}`)
        .then((res) => setUnreadCounts(res.data))
        .catch((err) => console.error("Error fetching unread counts:", err));
    }
  }, [currentUser]);

  // Fetch messages between current and selected user
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    axios
      .get(`http://localhost:5000/api/messages/${currentUser.id}/${selectedUser.id}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages:", err));
  }, [currentUser, selectedUser]);

  // Listen for incoming messages
  useEffect(() => {
    if (!currentUser) return;

    const listener = `receiveMessage:${currentUser.id}`;

    const handleIncoming = (message) => {
      const normalizedMessage = {
        ...message,
        sender_id: message.sender_id || message.senderId,
      };

      const isExists = messages.some((msg) => msg.id === message.id);
      if (!isExists) {
        // Add to message list only if sender is selected user
        if (selectedUser?.id === normalizedMessage.sender_id) {
          setMessages((prev) => [...prev, normalizedMessage]);
        } else {
          setUnreadCounts((prev) => ({
            ...prev,
            [normalizedMessage.sender_id]: (prev[normalizedMessage.sender_id] || 0) + 1,
          }));
        }
      }
    };

    socket.on(listener, handleIncoming);
    return () => socket.off(listener, handleIncoming);
  }, [currentUser, messages, selectedUser]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle user selection and mark messages as read
  const selectUser = async (user) => {
    setSelectedUser(user);
    setMessages([]);

    try {
      await axios.put("http://localhost:5000/api/messages/markAsRead", {
        senderId: user.id,
        receiverId: currentUser.id,
      });

      // Refresh messages
      const res = await axios.get(
        `http://localhost:5000/api/messages/${currentUser.id}/${user.id}`
      );
      setMessages(res.data);

      // Clear unread count
      setUnreadCounts((prev) => ({
        ...prev,
        [user.id]: 0,
      }));
    } catch (err) {
      console.error("Error marking or fetching messages:", err);
    }
  };

  // Handle sending message
  const sendMessage = () => {
    if (!newMessage.trim() || !currentUser || !selectedUser) return;

    const msgData = {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      message: newMessage,
    };

    socket.emit("sendMessage", msgData);
    setMessages((prev) => [...prev, { ...msgData, sender_id: currentUser.id }]);
    setNewMessage("");
  };


    return (
      <>
        <div className="chat-header">
          <h2>Campus-Network</h2>
        </div>
        <div style={{ marginBottom: "20px" }}>
        <Link to={`/home/${user_id}`} className="back-to-home-link">
  ← Back to Home
</Link>

      </div>

        <div className="chat-container">
          <div className="user-list">
            <h3>Users</h3>
            {users.map((user) => (
              <div
                key={user.id}
                className={`user ${selectedUser?.id === user.id ? "active" : ""}`}
                onClick={() => selectUser(user)}
              >
                <span>{user.name}</span>
                {unreadCounts[user.id] > 0 && (
                  <span className="unread-badge">{unreadCounts[user.id]}</span>
                )}
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
      </>
    );
    
};

export default MessagesPage;
