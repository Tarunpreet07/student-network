import React, { useState, useEffect } from "react";
import axios from "axios";

const MessagesPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch users (people you can message)
  useEffect(() => {
    axios.get("http://localhost:5000/users")
      .then(response => {
        setUsers(response.data);
        setFilteredUsers(response.data);
      })
      .catch(error => console.error("Error fetching users:", error));

    axios.get("http://localhost:5000/chats")
      .then(response => setChats(response.data))
      .catch(error => console.error("Error fetching chats:", error));
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setFilteredUsers(users.filter(user =>
      user.username.toLowerCase().includes(e.target.value.toLowerCase())
    ));
  };

  // Select a chat & fetch messages
  const openChat = (chatId) => {
    setSelectedChat(chatId);
    axios.get(`http://localhost:5000/messages?chatId=${chatId}`)
      .then(response => setMessages(response.data))
      .catch(error => console.error("Error fetching messages:", error));
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    axios.post("http://localhost:5000/messages", {
      chatId: selectedChat,
      content: newMessage,
    }).then(() => {
      setMessages([...messages, { content: newMessage, sender: "You" }]);
      setNewMessage("");
    }).catch(error => console.error("Error sending message:", error));
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Left Sidebar: Chats & Search */}
      <div style={{ width: "30%", borderRight: "1px solid #ccc", padding: "20px" }}>
        <h2>Messages</h2>
        
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search people..."
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />

        {/* Chat List */}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {chats.map(chat => (
            <li key={chat.id} 
                style={{ padding: "10px", borderBottom: "1px solid #ddd", cursor: "pointer", backgroundColor: selectedChat === chat.id ? "#f0f0f0" : "white" }}
                onClick={() => openChat(chat.id)}>
              <strong>{chat.username}</strong>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Side: Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px" }}>
        {selectedChat ? (
          <>
            <h3>Chat with {chats.find(chat => chat.id === selectedChat)?.username}</h3>
            
            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: "auto", border: "1px solid #ccc", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
              {messages.map((msg, index) => (
                <p key={index} style={{ textAlign: msg.sender === "You" ? "right" : "left", background: msg.sender === "You" ? "#dcf8c6" : "#f1f1f1", padding: "5px", borderRadius: "5px", marginBottom: "5px" }}>
                  {msg.content}
                </p>
              ))}
            </div>

            {/* Message Input */}
            <div style={{ display: "flex" }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              <button onClick={sendMessage} style={{ marginLeft: "10px", padding: "10px", cursor: "pointer" }}>
                Send
              </button>
            </div>
          </>
        ) : (
          <h3>Select a chat to start messaging</h3>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
