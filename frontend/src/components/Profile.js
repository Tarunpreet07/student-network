import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/profile.css'; // Import the stylesheet for styling

const Profile = () => {
  const { userId } = useParams(); // Get userId from URL
  const [profile, setProfile] = useState(null);
  const [newProfilePic, setNewProfilePic] = useState(null); // For file input
  const [newBio, setNewBio] = useState('');
  const [posts, setPosts] = useState([]); // To store user posts
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch user profile data and posts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
        setNewProfilePic(data.profile_pic);
        setNewBio(data.bio);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data); // Store fetched posts
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProfile();
    fetchPosts();
  }, [userId]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('bio', newBio);

    // Append the new profile picture if selected
    if (newProfilePic) {
      formData.append('profile_pic', newProfilePic);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        body: formData, // Sending the formData which includes the file
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        navigate(`/profile/${userId}`); // Navigate to the same profile page after update
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (!profile) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-pic-container">
          <img
            src={`http://localhost:5000/${profile.profile_pic}`}
            alt="Profile"
            className="profile-pic"
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-email">{profile.email}</p>
          <p className="profile-bio">{profile.bio}</p>
          <form onSubmit={handleUpdateProfile} className="update-form">
            <div className="input-container">
              <label>Profile Picture:</label>
              <input
                type="file"
                onChange={(e) => setNewProfilePic(e.target.files[0])} // Handle file selection
              />
            </div>
            <div className="input-container">
              <label>Bio:</label>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="Enter your bio"
              />
            </div>
            <button type="submit" className="update-btn">Update Profile</button>
          </form>
        </div>
      </div>

      {/* Posts Gallery */}
      <div className="posts-gallery">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div className="post-item" key={post.id}>
              {post.image && <img src={`http://localhost:5000/${post.image}`} alt="Post" className="post-img" />}
              {post.pdf && <a href={`http://localhost:5000/${post.pdf}`} target="_blank" rel="noopener noreferrer">View PDF</a>}
              <p>{post.text}</p>
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
