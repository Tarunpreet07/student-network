import React, { useState } from "react";
import { useParams, Link } from 'react-router-dom';
import "../styles/home.css";
import { FaHome, FaSearch, FaBell, FaEnvelope, FaUser } from "react-icons/fa";
import LogoutIcon from '@mui/icons-material/Logout';

const Homepage = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const { userId } = useParams();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="homepage">
      {/* Header */}
      <div className="header">
        <div className="logo">📚 CAMPUS-NETWORK</div>
        <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar-left ${isSidebarVisible ? 'show' : ''}`}>
        <Link to={`/home/${userId}`} className="sidebar-item"><FaHome /><span>Home</span></Link>
        <Link to={`/search/${userId}`} className="sidebar-item"><FaSearch /><span>Search</span></Link>
        <Link to={`/notifications/${userId}`} className="sidebar-item"><FaBell /><span>Notifications</span></Link>
        <Link to={`/messages/${userId}`} className="sidebar-item"><FaEnvelope /><span>Messages</span></Link>
        <Link to={`/profile/${userId}`} className="sidebar-item"><FaUser /><span>Profile</span></Link>
        <div className="sidebar-item logout" onClick={handleLogout}>
          <LogoutIcon /><span>Logout</span>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isSidebarVisible ? 'shift' : ''}`}>
        {/* Intro Banner */}
        <div className="intro-banner">
          <h1>Welcome to Campus-Network 🎓</h1>
          <p>
            Campus-Network is a student-centered platform designed to enhance academic and social life within your campus.
            It empowers you to connect with peers, discover student communities, and stay updated with everything happening around you.
          </p>
          <p>
            Whether you're looking to find group study partners, explore shared interests,
            or simply chat with friends, Campus-Network brings it all together in one place. Our smart search and messaging features
            make communication seamless and effective.
          </p>
          <p>
            You can also share posts, upload notes, and explore resources shared by others — making it a true knowledge-sharing ecosystem
            built by students, for students.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="features-section">
          <div className="feature-card">
            <h3>💬 Messaging</h3>
            <p>Instantly chat with classmates for smooth collaboration and communication.</p>
          </div>
          <div className="feature-card">
            <h3>🔍 Smart Search</h3>
            <p>Easily find fellow students, posts, and resources using our intelligent search system.</p>
          </div>
          <div className="feature-card">
            <h3>📝 Posting</h3>
            <p>Share updates, ideas, or questions — and engage with others through community posts.</p>
          </div>
          <div className="feature-card">
            <h3>📚 Resource Sharing</h3>
            <p>Upload and access study materials, project files, and campus resources in one place.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
