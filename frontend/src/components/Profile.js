import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/profile.css';

const Profile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [newBio, setNewBio] = useState('');
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile and posts
  useEffect(() => {
    setLoading(true);
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}/profile`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
        setProfilePicPreview(data.profile_pic);  // Set the profile picture path from backend
        setNewBio(data.bio);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data);
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
    setLoading(true);
    const formData = new FormData();
    formData.append('bio', newBio);
    if (newProfilePic) {
      formData.append('profile_pic', newProfilePic);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        navigate(`/profile/${userId}`);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!profile) return <div className="error-message">Profile not found.</div>;

  return (
    <div className="profile-container">
      {error && <div className="error-message">{error}</div>}
      <div className="profile-header">
        <div className="profile-pic-container">
          <img
            // If the profile picture exists, use the backend-provided URL, otherwise use a default
            src={profilePicPreview ? `http://localhost:5000${profilePicPreview}` : '/default-profile-pic.png'}
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
                onChange={(e) => {
                  const file = e.target.files[0];
                  setNewProfilePic(file);
                  if (file) {
                    setProfilePicPreview(URL.createObjectURL(file)); // Preview for the user
                  }
                }}
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
            <button type="submit" disabled={loading}>Update Profile</button>
          </form>
        </div>
      </div>
      <div className="posts">
        <h2>Posts</h2>
        {posts.length === 0 ? <p>No posts available</p> : posts.map(post => (
          <div key={post.id} className="post">
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
