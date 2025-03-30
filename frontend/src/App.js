import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MessagesPage from "./pages/MessagesPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/messages" element={<MessagesPage />} />
      </Routes>
    </Router>
  );
};

export default App;
