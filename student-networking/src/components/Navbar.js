import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const userId = sessionStorage.getItem("userId");  // Get userId from sessionStorage

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center text-white">
      <h1 className="text-2xl font-bold">Student Network</h1>
      <div className="flex space-x-4">
        {userId ? (
          <>
            <Link to={`/home/${userId}`} className="cursor-pointer">🏠 Home</Link>
            <Link to={`/messages/${userId}`} className="cursor-pointer">💬 Messages</Link>
          </>
        ) : (
          <Link to="/login" className="cursor-pointer">🔑 Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
