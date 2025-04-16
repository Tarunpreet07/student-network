import React, { useState } from "react";
import "../styles/home.css";
import {
  FaHome,
  FaSearch,
  FaBell,
  FaEnvelope,
  FaUser,
  FaEllipsisH,
  FaHeart,
  FaRegComment,
  FaSun,
  FaMoon,
} from "react-icons/fa";

const Homepage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    // Clear session or tokens here, then redirect
    localStorage.clear();
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <div className={`homepage ${darkMode ? "dark" : "light"}`}>
      {/* Header */}
      <div className="header">
        <div className="logo">CAMPUS-NETWORK</div>
        <div className="stories">
          <div className="story">
            <img src="https://via.placeholder.com/50" alt="story" />
            <p>Story 1</p>
          </div>
          <div className="story">
            <img src="https://via.placeholder.com/50" alt="story" />
            <p>Story 2</p>
          </div>
        </div>
        <div className="theme-toggle" onClick={toggleTheme}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </div>
      </div>

      {/* Sidebar - Left */}
      <div className="sidebar-left">
        <div className="sidebar-item"><FaHome /> <span>Home</span></div>
        <div className="sidebar-item"><FaSearch /> <span>Search</span></div>
        <div className="sidebar-item"><FaBell /> <span>Notifications</span></div>
        <div className="sidebar-item"><FaEnvelope /> <span>Messages</span></div>
        <div className="sidebar-item"><FaUser /> <span>Profile</span></div>
        
        {/* More Button */}
        <div
          className="sidebar-item-1"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <FaEllipsisH /> <span>More</span>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="dropdown-menu">
            <button onClick={toggleTheme}>
              {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>
            <button onClick={handleLogout}>🚪 Logout</button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="post">
          <div className="post-header">
            <img src="https://via.placeholder.com/32" alt="User" />
            <span>Username</span>
          </div>
          <img src="https://via.placeholder.com/500x300" alt="Post" className="post-image" />
          <div className="post-actions">
            <FaHeart /> <span>Like</span>
            <FaRegComment /> <span>Comment</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="sidebar-right">
        <div className="suggestions">
          <h4>Suggestions For You</h4>
          <div className="suggestion-item">
            <img src="https://via.placeholder.com/32" alt="Suggest" />
            <div>
              <p>username1</p>
              <button>Follow</button>
            </div>
          </div>
          <div className="suggestion-item">
            <img src="https://via.placeholder.com/32" alt="Suggest" />
            <div>
              <p>username2</p>
              <button>Follow</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
