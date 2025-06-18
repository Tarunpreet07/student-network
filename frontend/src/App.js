import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Messages from './pages/MessagesPage';
import Notifications from './components/Notifications';

import Profile from './components/Profile';
import Resources from './components/Resources';
import Search from './components/Search';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home/:userId" element={<Home />} />
        <Route path="/messages/:user_id" element={<Messages />} />
        <Route path="/notifications/:userId" element={<Notifications />} /> {/* ✅ Updated */}
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/search/:userId" element={<Search />} />  {/* ✅ CORRECT */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
