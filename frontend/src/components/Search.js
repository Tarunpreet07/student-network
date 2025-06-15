import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // <-- Import useNavigate
import "./Search.css";

const Search = () => {
  const [query, setQuery] = useState("");  
  const [searchType, setSearchType] = useState("users");  
  const [results, setResults] = useState([]);  
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState("");  

  const navigate = useNavigate();  // <-- Initialize navigate

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

      const users = response.data?.table?.rows || [];  

      if (users.length === 0) {
        setError(`No ${searchType} found.`);  
      } else {
        setResults(users);  
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      setError(backendMessage || "An error occurred while searching.");
    } finally {
      setLoading(false);  
    }
  };

  // New function to handle clicking on user name
  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="search-container">
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
        <button
          className={searchType === "posts" ? "active" : ""}
          onClick={() => handleSearchTypeChange("posts")}
        >
          Posts
        </button>
        <button
          className={searchType === "resources" ? "active" : ""}
          onClick={() => handleSearchTypeChange("resources")}
        >
          Notes
        </button>
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
                    <th>Email</th>
                    <th>Branch</th>
                    <th>Year</th>
                    <th>Bio</th>
                  </>
                )}
                {searchType === "posts" && (
                  <>
                    <th>Title</th>
                    <th>Content</th>
                    <th>Created At</th>
                  </>
                )}
                {searchType === "resources" && (
                  <>
                    <th>Title</th>
                    <th>Subject</th>
                    <th>Tags</th>
                    <th>Downloads</th>
                    <th>Uploaded At</th>
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
                        {/* Make name clickable and navigate on click */}
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
                      <td>{item.email}</td>
                      <td>{item.branch}</td>
                      <td>{item.year}</td>
                      <td>{item.bio}</td>
                    </>
                  )}
                  {searchType === "posts" && (
                    <>
                      <td>{item.title}</td>
                      <td>{item.content}</td>
                      <td>{item.createdAt}</td>
                    </>
                  )}
                  {searchType === "resources" && (
                    <>
                      <td>{item.title}</td>
                      <td>{item.subject}</td>
                      <td>{item.tags}</td>
                      <td>{item.downloads}</td>
                      <td>{item.uploadedAt}</td>
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
