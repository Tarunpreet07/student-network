import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/search.css";// Make sure this path is correct

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(saved);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const res = await axios.get(`/api/search?query=${query}`);
      setResults(res.data);

      // Save to recent searches
      let saved = JSON.parse(localStorage.getItem("recentSearches")) || [];
      saved = [query, ...saved.filter((item) => item !== query)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(saved));
      setRecentSearches(saved);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleRecentClick = (item) => {
    setQuery(item);
    handleSearch();
  };

  return (
    <div className="search-page">
      <h2>Search</h2>
      <div className="search-box">
        <input
          type="text"
          placeholder="Search for users or posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <h4>Recent Searches</h4>
          {recentSearches.map((item, index) => (
            <p key={index} onClick={() => handleRecentClick(item)}>
              {item}
            </p>
          ))}
        </div>
      )}

      <div className="search-results">
        {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} className="search-result-item">
              <img src={result.profilePic || "https://via.placeholder.com/40"} alt="Profile" />
              <div>
                <p><strong>{result.username}</strong></p>
                <p>{result.bio || "No bio available"}</p>
              </div>
            </div>
          ))
        ) : (
          query && <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default Search;
