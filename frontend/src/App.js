import React, { useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setSearched(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setResults([]);
    }
    setIsLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AniDB 🎬</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for dialogue..."
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </header>
      <main className="results-container">
        {isLoading && <p>Loading...</p>}
        {!isLoading && searched && results.length === 0 && <p>No results found.</p>}
        {!isLoading && results.length > 0 && (
          <ul className="results-list">
            {results.map((scene, index) => (
              <li key={index} className="result-item">
                <p className="dialogue">"{scene.dialogue}"</p>
                <p className="metadata">
                  <strong>{scene.series_name}</strong> - Episode {scene.episode_number} (at {scene.start_time.split(',')[0]})
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default App;