import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./components/Homepage";
import Navbar from "./components/Navbar";
// Assuming Messages component is handled by the other team and imported here
import Messages from "./components/Messages";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Route for user-specific homepage */}
        <Route path="/home/:userId" element={<Homepage />} />

        {/* Route for user-specific messages page */}
        <Route path="/messages/:userId" element={<Messages />} />
      </Routes>
    </Router>
  );
}

export default App;
