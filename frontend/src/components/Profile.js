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
  const [resources, setResources] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}/profile`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
        setProfilePicPreview(data.profile_pic);
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

    const fetchResources = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/resources/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch resources');
        const data = await response.json();
        setResources(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProfile();
    fetchPosts();
    fetchResources();
  }, [userId]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('bio', newBio);
    if (newProfilePic) formData.append('profile_pic', newProfilePic);

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        setEditMode(false);
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
            src={profilePicPreview ? `http://localhost:5000${profilePicPreview}` : '/default-profile-pic.png'}
            alt="Profile"
            className="profile-pic"
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-email">{profile.email}</p>

          {!editMode && (
            <>
              <p className="profile-bio">{profile.bio}</p>
              <button onClick={() => setEditMode(true)}>Edit Profile</button>
            </>
          )}

          {editMode && (
            <form onSubmit={handleUpdateProfile} className="update-form">
              <div className="input-container">
                <label>Profile Picture:</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setNewProfilePic(file);
                    if (file) {
                      setProfilePicPreview(URL.createObjectURL(file));
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
              <button type="submit" disabled={loading}>Save Changes</button>
              <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
            </form>
          )}
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

      <div className="resources">
        <h2>Resources</h2>
        {resources.length === 0 ? <p>No resources uploaded</p> : (
          resources.map(resource => (
            <div key={resource.id} className="resource">
              <h3>{resource.title}</h3>
              <p>{resource.description}</p>
              <a
                href={`http://localhost:5000/uploads/${resource.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download/View
              </a>
              <p className="uploaded-date">Uploaded on: {new Date(resource.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
