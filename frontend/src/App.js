import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home"; // This is where the pre-made homepage will be rendered

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home/:userId" element={<Home />} /> {/* Dynamic home page */}
      </Routes>
    </Router>
  );
};

export default App;
