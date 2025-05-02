import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';  // ⬅️ Make sure you import axios
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

  const [editProfilePic, setEditProfilePic] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [addPost, setAddPost] = useState(false);
  const [addResource, setAddResource] = useState(false);

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState('');

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}/profile`);
        setProfile(response.data);
        setProfilePicPreview(response.data.profile_pic || '/default-profile-pic.png');
        setNewBio(response.data.bio);
      } catch (error) {
        setError(`Profile Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${userId}`);
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError('Failed to fetch posts.');
      }
    };

    const fetchResources = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/resources/${userId}`);
        setResources(response.data);
      } catch (error) {
        setError(`Resources Error: ${error.message}`);
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
      await axios.put(`http://localhost:5000/api/users/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Profile updated successfully!');
      setEditProfilePic(false);
      setEditBio(false);
      navigate(`/profile/${userId}`);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('userId', userId); // ⬅️ Important: Send userId along
    formData.append('content', newPostContent);
    if (newPostImage) formData.append('image', newPostImage);

    try {
      const response = await axios.post(`http://localhost:5000/api/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPosts([...posts, response.data]);
      setNewPostContent('');
      setNewPostImage(null);
      setPostImagePreview('');
      setAddPost(false);
    } catch (error) {
      console.error('Post creation error:', error);
      setError(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    formData.append('userId', userId); // ⬅️ Also send userId with resource

    try {
      const response = await axios.post(`http://localhost:5000/api/resources`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResources([...resources, response.data]);
      setAddResource(false);
      e.target.reset();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload resource');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!profile) return <div className="error-message">Profile not found.</div>;

  return (
    <div className="profile-container">
      {error && <div className="error-message">{error}</div>}

      {/* PROFILE HEADER */}
      <div className="profile-header">
        <div className="profile-pic-container">
          <img
            src={`http://localhost:5000${profilePicPreview}`}
            alt="Profile"
            className="profile-pic"
          />
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-email">{profile.email}</p>
          <p className="profile-bio">{profile.bio || 'No bio available'}</p>

          {/* DROPDOWN ACTIONS */}
          <div className="profile-actions">
            <div className="dropdown">
              <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                Actions ⌄
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => { setEditProfilePic(true); setDropdownOpen(false); }}>Edit Profile Picture</button>
                  <button onClick={() => { setEditBio(true); setDropdownOpen(false); }}>Edit Bio</button>
                  <button onClick={() => { setAddPost(true); setDropdownOpen(false); }}>Add Post</button>
                  <button onClick={() => { setAddResource(true); setDropdownOpen(false); }}>Upload Resource</button>
                </div>
              )}
            </div>
          </div>

          {/* EDIT PROFILE PIC FORM */}
          {editProfilePic && (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <label>New Profile Picture:</label>
              <input type="file" onChange={(e) => {
                const file = e.target.files[0];
                setNewProfilePic(file);
                if (file) setProfilePicPreview(URL.createObjectURL(file));
              }} />
              <button type="submit" disabled={loading}>Save</button>
              <button type="button" onClick={() => setEditProfilePic(false)}>Cancel</button>
            </form>
          )}

          {/* EDIT BIO FORM */}
          {editBio && (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <label>New Bio:</label>
              <textarea value={newBio} onChange={(e) => setNewBio(e.target.value)} />
              <button type="submit" disabled={loading}>Save</button>
              <button type="button" onClick={() => setEditBio(false)}>Cancel</button>
            </form>
          )}
        </div>
      </div>

      {/* ADD POST FORM */}
      {addPost && (
        <div className="new-post">
          <h2>Create a New Post</h2>
          <form onSubmit={handleNewPost}>
            <textarea
              placeholder="What's on your mind?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            <label>Upload Image:</label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                setNewPostImage(file);
                if (file) setPostImagePreview(URL.createObjectURL(file));
              }}
            />
            {postImagePreview && (
              <img src={postImagePreview} alt="Post Preview" className="post-image-preview" />
            )}
            <button type="submit" disabled={loading}>Post</button>
            <button type="button" onClick={() => setAddPost(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* ADD RESOURCE FORM */}
      {addResource && (
        <div className="resource-upload">
          <h2>Upload Resource</h2>
          <form onSubmit={handleUploadResource}>
            <label>Title:</label>
            <input type="text" name="title" required />
            <label>Description:</label>
            <textarea name="description" required />
            <label>File:</label>
            <input type="file" name="file" required />
            <button type="submit" disabled={loading}>Upload</button>
            <button type="button" onClick={() => setAddResource(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* POSTS LIST */}
      <div className="posts-section">
        <h2>Your Posts</h2>
        {posts.length === 0 ? <p>No posts available</p> : posts.map((post) => (
          <div key={post._id} className="post">
            <p>{post.content}</p>
            {post.image && <img src={`http://localhost:5000${post.image}`} alt="Post" />}
          </div>
        ))}
      </div>

      {/* RESOURCES LIST */}
      <div className="resources-section">
        <h2>Your Resources</h2>
        {resources.length === 0 ? <p>No resources available</p> : resources.map((resource) => (
          <div key={resource._id} className="resource">
            <h3>{resource.title}</h3>
            <p>{resource.description}</p>
            <a href={`http://localhost:5000${resource.file}`} download>Download</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
