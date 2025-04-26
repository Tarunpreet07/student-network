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

  // UI State
  const [editProfilePic, setEditProfilePic] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [addPost, setAddPost] = useState(false);
  const [addResource, setAddResource] = useState(false);

  // Post creation state
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}/profile`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
        setProfilePicPreview(data.profile_pic || '/default-profile-pic.png');
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
        setEditProfilePic(false);
        setEditBio(false);
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

  const handleNewPost = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', newPostContent);
    if (newPostImage) formData.append('image', newPostImage);

    try {
      const response = await fetch(`http://localhost:5000/api/posts`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const postData = await response.json();
        setPosts([...posts, postData]);
        setNewPostContent('');
        setNewPostImage(null);
        setPostImagePreview('');
        setAddPost(false);
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    try {
      const response = await fetch(`http://localhost:5000/api/resources`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const resourceData = await response.json();
        setResources([...resources, resourceData]);
        setAddResource(false);
        e.target.reset();
      } else {
        throw new Error('Failed to upload resource');
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
            src={`http://localhost:5000${profilePicPreview}`}
            alt="Profile Preview"
            className="profile-pic"
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-email">{profile.email}</p>
          <p className="profile-bio">{profile.bio || 'No bio available'}</p>

          <div className="profile-actions">
            <button onClick={() => setEditProfilePic(true)}>Edit Profile Picture</button>
            <button onClick={() => setEditBio(true)}>Edit Bio</button>
            <button onClick={() => setAddPost(true)}>Add Post</button>
            <button onClick={() => setAddResource(true)}>Upload Resource</button>
          </div>

          {editProfilePic && (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <label>New Profile Picture:</label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setNewProfilePic(file);
                  if (file) setProfilePicPreview(URL.createObjectURL(file));
                }}
              />
              <button type="submit" disabled={loading}>Save</button>
              <button type="button" onClick={() => setEditProfilePic(false)}>Cancel</button>
            </form>
          )}

          {editBio && (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <label>New Bio:</label>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
              />
              <button type="submit" disabled={loading}>Save</button>
              <button type="button" onClick={() => setEditBio(false)}>Cancel</button>
            </form>
          )}
        </div>
      </div>

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

      <div className="posts">
        <h2>Posts</h2>
        {posts.length === 0 ? <p>No posts available</p> : posts.map(post => (
          <div key={post.id} className="post">
            <p>{post.content}</p>
            {post.image_url && (
              <img
                src={`http://localhost:5000${post.image_url}`}
                alt="Post"
                className="post-image"
              />
            )}
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
              <p className="uploaded-date">
                Uploaded on: {new Date(resource.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
