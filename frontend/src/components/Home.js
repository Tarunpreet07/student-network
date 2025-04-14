import React from "react";
import "../styles/home.css";
import { FaHome, FaSearch, FaBell, FaEnvelope, FaUser, FaEllipsisH } from "react-icons/fa";

const Homepage = () => {
  return (
    <div className="homepage">
      {/* Header */}
      <div className="header">
        <div className="logo">CAMPUS-NETWORK</div>
        <div className="stories-highlights">
          <span className="story-highlight">Stories</span>
          <span className="story-highlight">Highlights</span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar-left">
        <div className="sidebar-item"><FaHome /> <span>Home</span></div>
        <div className="sidebar-item"><FaSearch /> <span>Search</span></div>
        <div className="sidebar-item"><FaBell /> <span>Notifications</span></div>
        <div className="sidebar-item"><FaEnvelope /> <span>Messages</span></div>
        <div className="sidebar-item"><FaUser /> <span>Profile</span></div>
        <div className="sidebar-item"><FaEllipsisH /> <span>More</span></div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Example post - repeat with data */}
        <div className="post">
          <div className="post-header">
            <img src="https://via.placeholder.com/32" alt="User" />
            <span>Username</span>
          </div>
          <img src="https://via.placeholder.com/500x300" alt="Post" className="post-image" />
          <div className="post-actions">
            <span>Like</span>
            <span>Comment</span>
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
