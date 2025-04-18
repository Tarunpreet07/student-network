import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
        <Route path="/" element={<Register />} /> {/* Register now opens first */}
        <Route path="/login" element={<Login />} />
        <Route path="/home/:userId" element={<Home />} />
        <Route path="/messages/:userId" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
