// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importing components
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Messages from './pages/MessagesPage';
import Notifications from './components/NotificationPage';
import Profile from './components/Profile';
import Resources from './components/Resources';
import Search from './components/Search'; // Make sure this import exists

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔄 Changed default route to register instead of home */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home/:userId" element={<Home />} />
        <Route path="/messages/:user_id" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile/:userId" element={<Profile />} />  {/* Dynamic route for profile */}
        <Route path="/resources" element={<Resources />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
