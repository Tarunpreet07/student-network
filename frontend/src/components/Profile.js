import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/profile.css';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profileResponse = await axios.get(`http://localhost:5000/api/users/${userId}/profile`);
        setProfile(profileResponse.data);
        setProfilePicPreview(profileResponse.data.profile_pic || '/default-profile-pic.png');
        setNewBio(profileResponse.data.bio);

        const postsResponse = await axios.get(`http://localhost:5000/api/posts/${userId}`);
        setPosts(postsResponse.data);

        const resourcesResponse = await axios.get(`http://localhost:5000/api/resources/${userId}`);
        setResources(resourcesResponse.data);
      } catch (error) {
        setError(`Error fetching data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleUpdateProfile = async (e, updateType) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (updateType === 'bio') formData.append('bio', newBio);
    if (updateType === 'profile_pic' && newProfilePic) formData.append('profile_pic', newProfilePic);

    try {
      await axios.put(`http://localhost:5000/api/users/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Profile updated successfully!');
      setEditProfilePic(false);
      setEditBio(false);
      navigate(`/profile/${userId}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('content', newPostContent);
    if (newPostImage) formData.append('image', newPostImage);

    try {
      const response = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPosts((prevPosts) => [...prevPosts, response.data]);
      setNewPostContent('');
      setNewPostImage(null);
      setPostImagePreview('');
      setAddPost(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', e.target.title.value);
    formData.append('description', e.target.description.value);
    formData.append('file', e.target.file.files[0]);
    formData.append('user_id', userId);

    try {
      const response = await axios.post('http://localhost:5000/api/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResources((prevResources) => [...prevResources, response.data.resource]);
      setAddResource(false);
      e.target.reset();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to upload resource');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setNewProfilePic(file);
    if (file) setProfilePicPreview(URL.createObjectURL(file));
  };

  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    setNewPostImage(file);
    if (file) setPostImagePreview(URL.createObjectURL(file));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!profile) return <div className="error-message">Profile not found.</div>;

  return (
    <div className="profile-container">
      {/* ✅ Updated: Back to Home Button */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate('/')}
          style={{
            fontSize: '16px',
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          ← Back to Home
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Profile Header */}
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

          {/* Actions Dropdown */}
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

          {editProfilePic && (
            <form onSubmit={(e) => handleUpdateProfile(e, 'profile_pic')} className="edit-form">
              <label>New Profile Picture:</label>
              <input type="file" onChange={handleProfilePicChange} />
              <button type="submit" disabled={loading}>Save</button>
              <button type="button" onClick={() => setEditProfilePic(false)}>Cancel</button>
            </form>
          )}

          {editBio && (
            <form onSubmit={(e) => handleUpdateProfile(e, 'bio')} className="edit-form">
              <label>New Bio:</label>
              <textarea value={newBio} onChange={(e) => setNewBio(e.target.value)} />
              <button type="submit" disabled={loading}>Save</button>
              <button type="button" onClick={() => setEditBio(false)}>Cancel</button>
            </form>
          )}
        </div>
      </div>

      {/* Add Post */}
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
            <input type="file" onChange={handlePostImageChange} />
            {postImagePreview && (
              <img src={postImagePreview} alt="Post Preview" className="post-image-preview" />
            )}
            <button type="submit" disabled={loading}>Post</button>
            <button type="button" onClick={() => setAddPost(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* Upload Resource */}
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

      {/* Posts */}
      <div className="content-section"></div>
      <div className="posts-section">
        <h2>Posts</h2>
        {posts.length === 0 ? <p>No posts available</p> : posts.map((post) => (
          <div key={post._id} className="post">
            <p>{post.content}</p>
            {post.image_url && (
              <img src={`http://localhost:5000${post.image_url}`} alt="Post" />
            )}
          </div>
        ))}
      </div>

      {/* Resources */}
      <div className="content-section">
        <div className="resources-section">
          <h2>Resources</h2>
          {resources.length === 0 ? (
            <p>No resources available</p>
          ) : (
            resources.map((resource) => {
              const pdfUrl = `http://localhost:5000${resource.file_url}`;
              return (
                <div key={resource.id} className="resource-item" style={{ marginBottom: '40px' }}>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <button
                    onClick={() => window.open(pdfUrl, '_blank')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      marginRight: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Preview PDF
                  </button>
                  <a
                    href={`http://localhost:5000/files/download/${resource.file_url.replace('/uploads/', '')}`}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '5px'
                    }}
                  >
                    Download PDF
                  </a>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
