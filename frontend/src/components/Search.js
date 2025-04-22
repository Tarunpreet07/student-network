import React, { useState } from 'react';
import axios from 'axios';
import './Search.css';

function Search() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('users');
  const [results, setResults] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search term');
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.get(`http://localhost:5000/api/search/${type}`, {
        params:
          type === 'users'
            ? { name: query }
            : type === 'resources'
            ? { title: query }
            : { title: query, content: query },
      });

      const { table } = res.data;
      setHeaders(table.headers);
      setResults(table.rows);
    } catch (error) {
      console.error('Search error:', error);
      setError('Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setQuery('');
    setResults([]);
    setHeaders([]);
    setError('');
  };

  return (
    <div className="search-container">
      <h2>Search {type.charAt(0).toUpperCase() + type.slice(1)}</h2>

      {/* Search Bar */}
      <div className="search-controls">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${type}...`}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Type Selection Buttons */}
      <div className="search-buttons">
        <button
          className={type === 'users' ? 'active' : ''}
          onClick={() => handleTypeChange('users')}
        >
          Users
        </button>
        <button
          className={type === 'resources' ? 'active' : ''}
          onClick={() => handleTypeChange('resources')}
        >
          Notes
        </button>
        <button
          className={type === 'posts' ? 'active' : ''}
          onClick={() => handleTypeChange('posts')}
        >
          Posts
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && <p>Loading...</p>}

      {/* Results Table */}
      {results.length > 0 && !loading && (
        <table>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, i) => (
              <tr key={i}>
                {row.map((col, j) => (
                  <td key={j}>{col}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* If no results */}
      {!loading && results.length === 0 && !error && <p>No results found.</p>}
    </div>
  );
}

export default Search;
