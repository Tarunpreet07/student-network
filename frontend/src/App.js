import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MessagesPage from "./pages/MessagesPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Corrected route to match backend API and frontend navigation */}
          <Route path="/messages/:user_id" element={<MessagesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
