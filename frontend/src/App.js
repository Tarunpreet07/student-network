import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Messages from './pages/MessagesPage';
import Notifications from './components/NotificationPage';
import Profile from './components/Profile';
import Resources from './components/Resources';
import Search from './components/Search';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home/1" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home/:userId" element={<Home />} />
        <Route path="/messages/:user_id" element={<Messages />} />  {/* Dynamic route for messages */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/search" element={<Search />} />
        
      </Routes>
    </BrowserRouter>
  );
}


export default App;
