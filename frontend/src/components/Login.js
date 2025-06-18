import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ name: '', password: '' });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [showRegisterOption, setShowRegisterOption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ prevent double submit

  const navigate = useNavigate();

  // ✅ Redirect to /register if showRegisterOption is true
  useEffect(() => {
    if (showRegisterOption) {
      navigate('/register');
    }
  }, [showRegisterOption, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // ✅ prevent multiple rapid submissions
    setIsSubmitting(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);

      setMessage(res.data.message);
      setSuccess(true);
      localStorage.setItem('token', res.data.token);

      // ✅ Redirect after login
      setTimeout(() => {
        navigate(`/home/${res.data.userId}`);
      }, 1000);

    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="chat-header">
        <h2>Campus-Network</h2>
      </div>
  
      <div className="auth-container">
        <div className="auth-form">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
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
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
  
          {message && <p className={success ? 'success' : 'error'}>{message}</p>}
  
          {!showRegisterOption && (
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
                  fontSize: '1em',
                }}
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </div>
    </>
  );
  
};

export default Login;
