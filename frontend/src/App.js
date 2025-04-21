// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importing components
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Messages from './pages/MessagesPage';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import Resources from './components/Resources';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home/:userId" element={<Home />} />
        <Route path="/messages/:user_id" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
