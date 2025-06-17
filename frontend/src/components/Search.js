import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Search.css";

const Search = () => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("users");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setResults([]);
    setQuery("");
    setError("");
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await axios.get(`http://localhost:5000/api/search`, {
        params: { q: query, type: searchType },
        timeout: 5000,
      });

      const rows = response.data?.table?.rows || [];

      if (rows.length === 0) {
        setError(`No ${searchType} found.`);
      } else {
        setResults(rows);
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      setError(backendMessage || "An error occurred while searching.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="search-container">
      <div style={{ marginBottom: "20px" }}>
        <Link to="/home/1" className="back-to-home-link">
          ← Back to Home
        </Link>
      </div>

      <h1>Search</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="search-buttons">
        <button
          className={searchType === "users" ? "active" : ""}
          onClick={() => handleSearchTypeChange("users")}
        >
          Users
        </button>
        {/* Removed Posts and Notes buttons */}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {results.length > 0 && (
        <div className="results">
          <h2>Results for {searchType.charAt(0).toUpperCase() + searchType.slice(1)}</h2>
          <table>
            <thead>
              <tr>
                {searchType === "users" && (
                  <>
                    <th>Name</th>
                    <th>Branch</th>
                    <th>Year</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={index}>
                  {searchType === "users" && (
                    <>
                      <td>
                        <button
                          onClick={() => handleUserClick(item.id)}
                          style={{
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "blue",
                            textDecoration: "underline",
                          }}
                        >
                          {item.name}
                        </button>
                      </td>
                      <td>{item.branch}</td>
                      <td>{item.year}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results.length === 0 && !loading && query && !error && (
        <p>No {searchType} found.</p>
      )}
    </div>
  );
};

export default Search;
