import React, { useState } from "react";
import "../styles/home.css";
import { FaHome, FaSearch, FaBell, FaEnvelope, FaUser } from "react-icons/fa";
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from "react-router-dom"; // React Router Link for navigation

const Homepage = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible); // Toggle sidebar visibility
  };

  return (
    <div className="homepage">
      {/* Header */}
      <div className="header">
        <div className="logo">CAMPUS-NETWORK</div>
        <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button> {/* Button to toggle sidebar */}
      </div>

      {/* Sidebar - Left */}
      <div className={`sidebar-left ${isSidebarVisible ? 'show' : ''}`}>
        <Link to="/home/1" className="sidebar-item">
          <FaHome /> <span>Home</span>
        </Link>
        <Link to="/search" className="sidebar-item">
          <FaSearch /> <span>Search</span>
        </Link>
        <Link to="/notifications" className="sidebar-item">
          <FaBell /> <span>Notifications</span>
        </Link>
        <Link to="/messages/1" className="sidebar-item">
          <FaEnvelope /> <span>Messages</span>
        </Link>
        <Link to="/profile" className="sidebar-item">
          <FaUser /> <span>Profile</span>
        </Link>
        <div className="sidebar-item logout" onClick={handleLogout}>
          <LogoutIcon />
          <span>Logout</span>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isSidebarVisible ? 'shift' : ''}`}>
        {/* Post 1 */}
        <div className="post">
          <div className="post-header">
            <img src="https://via.placeholder.com/32" alt="User" />
            <span>Username</span>
          </div>
          <img src="https://via.placeholder.com/500x300" alt="Post" className="post-image" />
          <div className="post-actions">
            <span>❤️ Like</span>
            <span>💬 Comment</span>
          </div>
        </div>

        {/* Add more posts here */}
      </div>
    </div>
  );
};

export default Homepage;
