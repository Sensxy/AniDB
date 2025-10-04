import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import ResultsList from '../components/ResultsList';

const SearchPage = () => {
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
    <>
      <header className="App-header">
        <h1>AniDB 🎬</h1>
        <SearchBar 
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
          isLoading={isLoading}
        />
      </header>
      <main className="results-container">
        <ResultsList 
          results={results}
          isLoading={isLoading}
          searched={searched}
        />
      </main>
    </>
  );
};

export default SearchPage;