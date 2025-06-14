import React, { useState } from "react";
import axios from "axios";
import "./Search.css";
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState("");  // The search query
  const [searchType, setSearchType] = useState("users");  // Default search type
  const [results, setResults] = useState([]);  // Store search results
  const [loading, setLoading] = useState(false);  // Loading state
  const [error, setError] = useState("");  // Error message state
  const navigate = useNavigate();
  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setResults([]);  // Clear the results when search type changes
    setQuery("");  // Clear the query
    setError("");  // Reset any previous error
  };

  const handleSearch = async () => {
    if (!query.trim()) return;  // Prevent empty search queries

    setLoading(true);  // Start loading spinner
    setError("");  // Reset error message
    setResults([]);  // Clear previous results

    try {
      // Construct the API endpoint based on the search type
      const response = await axios.get(`http://localhost:5000/api/search`, {
        params: { q: query, type: searchType },
        timeout: 5000,  // Timeout to avoid hanging requests
      });

      console.log("Backend Response:", response.data);

      const users = response.data?.table?.rows || [];  // Extract users from response

      if (users.length === 0) {
        setError(`No users found.`);  // No results found
      } else {
        setResults(users);  // Set the search results in state
      }
    } catch (err) {
      console.error("Search Error:", err);
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      setError(backendMessage || "An error occurred while searching.");
    } finally {
      setLoading(false);  // Stop loading spinner
    }
  };

  const handleHeaderClick = (headerName) => {
      navigate(`/profile/${headerName}`); // ✅ Correct redirect
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
                      <td onClick={() => handleHeaderClick(item.name)} style={{ cursor: "pointer" }}>{item.name}</td>
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
