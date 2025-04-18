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

  // Check socket connection
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket with ID:', socket.id);
    });

    return () => {
      socket.off('connect');
    };
  }, []);

  // Fetch all users except the logged-in user
  useEffect(() => {
    if (user_id) {
      console.log("Fetching users excluding user:", user_id);
      axios
        .get(`http://localhost:5000/api/users?exclude=${user_id}`)
        .then((res) => {
          if (res.data && Array.isArray(res.data)) {
            console.log("Users fetched:", res.data);
            setUsers(res.data);
          } else {
            console.error("Invalid response format for users:", res.data);
          }
        })
        .catch((err) => console.error("Error fetching users:", err));
    }
  }, [user_id]);

  // Fetch current user data
  useEffect(() => {
    if (user_id) {
      console.log("Fetching current user with ID:", user_id);
      axios
        .get(`http://localhost:5000/api/currentUser/${user_id}`)
        .then((res) => {
          if (res.data) {
            console.log("Current user fetched:", res.data);
            setCurrentUser(res.data);
          } else {
            console.error("Current user not found.");
          }
        })
        .catch((err) => console.error("Error fetching current user:", err));
    }
  }, [user_id]);

  // Fetch messages between the current user and the selected user
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    console.log(`Fetching messages between ${currentUser.id} and ${selectedUser.id}`);
    axios
      .get(
        `http://localhost:5000/api/messages/${currentUser.id}/${selectedUser.id}`
      )
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          console.log("Messages fetched:", res.data);
          setMessages(res.data);
        } else {
          console.error("Invalid response format for messages:", res.data);
        }
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [currentUser, selectedUser]);

  // Socket listener for incoming messages
  useEffect(() => {
    if (!currentUser) return;

    const listener = `receiveMessage:${currentUser.id}`;
    const handleIncoming = (message) => {
      console.log("Received message via socket:", message);
      const normalizedMessage = {
        ...message,
        sender_id: message.sender_id || message.senderId,
      };

      if (normalizedMessage.sender_id !== currentUser.id) {
        console.log("Adding message to state:", normalizedMessage);
        setMessages((prev) => [...prev, normalizedMessage]);
      }
    };

    socket.on(listener, handleIncoming);

    return () => {
      console.log("Removing socket listener for:", listener);
      socket.off(listener, handleIncoming);
    };
  }, [currentUser]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Select a user from the list to start chatting
  const selectUser = (user) => {
    console.log("Selected user:", user);
    setSelectedUser(user);
    setMessages([]);  // Clear previous messages when a new user is selected
  };

  // Send message functionality
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedUser) return;

    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      message: newMessage,
    };

    try {
      console.log("Sending message:", messageData);
      // Save message to DB
      await axios.post("http://localhost:5000/api/messages", messageData);

      // Emit the message to other clients via socket
      socket.emit("sendMessage", messageData);

      // Add the new message to the UI immediately
      setMessages((prev) => [
        ...prev,
        { ...messageData, sender_id: currentUser.id },
      ]);

      // Clear the input after sending
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="chat-container">
      <div className="user-list">
        <h3>Users</h3>
        {users.length === 0 ? (
          <p>No users available</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`user ${selectedUser?.id === user.id ? "active" : ""}`}
              onClick={() => selectUser(user)}
            >
              {user.name}
            </div>
          ))
        )}
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
