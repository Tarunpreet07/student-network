import React from 'react';
import { Link } from 'react-router-dom';  // Import Link for navigation
import { FaHome, FaSearch, FaBell, FaEnvelope, FaUser } from 'react-icons/fa';
import LogoutIcon from '@mui/icons-material/Logout';

const NotificationPage = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="homepage">
      {/* Header */}
      <div className="header">
        <div className="logo">CAMPUS-NETWORK</div>
      </div>

      {/* Sidebar - Left */}
      <div className="sidebar-left">
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
      <div className="main-content">
        <h1>Notifications</h1>
        {/* Example Notification */}
        <div className="notification">
          <div className="notification-header">
            <span>You have 3 new notifications</span>
          </div>
          <div className="notification-body">
            <p>John Doe commented on your post.</p>
            <p>Jane Doe liked your photo.</p>
            <p>Someone sent you a message.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
