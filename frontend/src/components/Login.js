import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css"; // Importing the CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State to store error messages
  const [successMessage, setSuccessMessage] = useState(""); // State to store success message
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setSuccessMessage("Login successful!"); // Set success message
      navigate(`/home/${res.data.userId}`);
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        setErrorMessage(error.response.data.message || "An error occurred");
      } else if (error.request) {
        // No response was received from the server
        setErrorMessage("No response received from the server");
      } else {
        // Some other error occurred
        setErrorMessage("An error occurred: " + error.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>

        {/* Display error or success message */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
    </div>
  );
};

export default Login;
