import React, { useState } from 'react';
import { registerUser } from '../api'; // Assuming you have an API file for backend requests

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [message, setMessage] = useState('');

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data to be sent to the server
    const userData = { name, email, password, profile_pic: profilePic };

    try {
      // Send the data to the backend API
      const res = await registerUser(userData);

      // Show a success message from the backend
      setMessage(res.data.message);
    } catch (err) {
      // Show error message if something goes wrong
      setMessage(err.response ? err.response.data.message : 'Something went wrong');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        {/* Name Input */}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {/* Profile Picture URL Input */}
        <input
          type="text"
          placeholder="Profile Picture URL"
          value={profilePic}
          onChange={(e) => setProfilePic(e.target.value)}
        />
        
        {/* Submit Button */}
        <button type="submit">Register</button>
      </form>

      {/* Display any success or error messages */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
