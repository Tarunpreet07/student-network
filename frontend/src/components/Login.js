import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ name: '', password: '' });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [showRegisterOption, setShowRegisterOption] = useState(false); // 👈 added state
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

      {/* 👇 Only show register option if user clicks */}
      {!showRegisterOption ? (
        <p>
          Don't have an account?{' '}
          <button
            onClick={() => setShowRegisterOption(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'blue',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: 0,
              fontSize: '1em'
            }}
          >
            Register here
          </button>
        </p>
      ) : (
        <button
          onClick={() => navigate('/register')}
          style={{
            marginTop: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Go to Registration Page
        </button>
      )}
    </div>
  );
};

export default Login;
