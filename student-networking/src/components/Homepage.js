import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");  // Get userId from sessionStorage

  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) {
      navigate("/login");  // Redirect to login if no userId is found in sessionStorage
    }

    // Fetch posts for the logged-in user
    axios.get(`http://localhost:5000/api/posts/${userId}`)
      .then(response => setPosts(response.data))
      .catch(error => console.error("Error fetching posts:", error));

    // Fetch notifications for the logged-in user
    axios.get(`http://localhost:5000/api/notifications/${userId}`)
      .then(response => setNotifications(response.data))
      .catch(error => console.error("Error fetching notifications:", error));
  }, [userId, navigate]);

  const goToMessages = () => {
    navigate(`/messages/${userId}`);  // Navigate to the messages page of the logged-in user
  };

  return (
    <div className="p-4">
      <h1 className="text-center font-bold text-xl mb-4">Welcome User {userId}</h1>

      {/* Posts Section */}
      <div className="posts-container">
        <h2 className="font-bold mb-4">Recent Posts</h2>
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="post-card border p-4 mb-4 bg-white shadow-md rounded">
              <div className="post-header flex items-center">
                <img src={post.profile_pic} alt={post.name} className="w-10 h-10 rounded-full" />
                <span className="ml-2 font-bold">{post.name}</span>
              </div>
              <p className="post-content mt-2">{post.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No posts available.</p>
        )}
      </div>

      {/* Notifications Section */}
      <div className="notifications-container mt-6">
        <h2 className="font-bold mb-4">Notifications</h2>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={index} className="notification-card border p-4 mb-4 bg-yellow-100 shadow-md rounded">
              <p className="text-gray-700">{notification.message}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No notifications available.</p>
        )}
      </div>

      {/* Button to go to Messages page */}
      <div className="text-center mt-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={goToMessages}>
          Go to Messages
        </button>
      </div>
    </div>
  );
}

export default Homepage;
