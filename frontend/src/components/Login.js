import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ name: '', password: '' });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      setMessage(res.data.message);
      setSuccess(true);

      localStorage.setItem('token', res.data.token);

      // ✅ Redirect to homepage after login
      setTimeout(() => {
        navigate(`/home/${res.data.userId}`); // ✅ Correct redirect
      }, 1000);
      
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
      setSuccess(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Username"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p className={success ? 'success' : 'error'}>{message}</p>}
    </div>
  );
};

export default Login;
