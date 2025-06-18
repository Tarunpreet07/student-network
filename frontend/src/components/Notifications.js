// src/components/Notifications.js

import React from "react";
import { RiMessage2Fill } from "react-icons/ri"; // Bold dark message icon
import { FaDownload } from "react-icons/fa";
import { useParams, Link } from 'react-router-dom';
import "./Notifications.css";

const dummyNotifications = [
  { id: 1, message: "Message from Alice", type: "message", timeAgo: "1d ago" },
  { id: 2, message: "You downloaded resource by Alice", type: "download", timeAgo: "1d ago" },
  { id: 3, message: "You downloaded resource by Alice", type: "download", timeAgo: "1d ago" },
  { id: 4, message: "You downloaded resource by Alice", type: "download", timeAgo: "1d ago" },
];

const getIcon = (type) => {
  switch (type) {
    case "message":
      return <RiMessage2Fill className="notif-icon message" />;
    case "download":
      return <FaDownload className="notif-icon download" />;
    default:
      return null;
  }
};

const Notifications = () => {
  const { userId } = useParams(); // ✅ Moved inside the component

  return (
    <div>
      <div className="chat-header">
        <h2>Campus-Network</h2>
      </div>

      <div style={{ margin: "20px" }}>
        <Link to={`/home/${userId}`} className="back-to-home-link">
          ← Back to Home
        </Link>
      </div>

      <div className="notif-wrapper">
        <main className="notif-card">
          <h2>🔔 Notifications</h2>
          <ul className="notif-list">
            {dummyNotifications.map((notif) => (
              <li key={notif.id} className="notif-item">
                {getIcon(notif.type)}
                <div className="notif-text">
                  <p>{notif.message}</p>
                  <small>{notif.timeAgo}</small>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
};

export default Notifications;
