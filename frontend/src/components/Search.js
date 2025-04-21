import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], notes: [], posts: [] });
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(
    debounce(async (searchQuery) => {
      setLoading(true);
      try {
        const [users, notes, posts] = await Promise.all([
          axios.get('/api/search/users', { params: { name: searchQuery } }),
          axios.get('/api/search/notes', { params: { subject: searchQuery } }),
          axios.get('/api/search/posts', { params: { title: searchQuery } }),
        ]);
        setResults({
          users: users.data,
          notes: notes.data,
          posts: posts.data,
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (query) {
      fetchResults(query);
    } else {
      setResults({ users: [], notes: [], posts: [] });
    }
  }, [query, fetchResults]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search users, notes, posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <p>Loading...</p>}
      <div>
        <h3>Users</h3>
        <ul>
          {results.users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
        <h3>Notes</h3>
        <ul>
          {results.notes.map((note) => (
            <li key={note.id}>{note.subject} - {note.semester}</li>
          ))}
        </ul>
        <h3>Posts</h3>
        <ul>
          {results.posts.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Search;
