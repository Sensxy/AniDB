import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ResultsList from '../components/ResultsList';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // This useEffect hook will run every time the 'query' state changes
  useEffect(() => {
    // If the query is empty, don't do anything
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Set a timer to make the API call after 500ms
    const searchTimer = setTimeout(() => {
      const performSearch = async () => {
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
      performSearch();
    }, 500); // 500 millisecond delay

    // This is the cleanup function. It runs before the next effect or when the component unmounts.
    // It's how we cancel the previous timer every time the user types a new letter.
    return () => {
      clearTimeout(searchTimer);
    };
  }, [query]); // The dependency array - this effect runs when 'query' changes

  return (
    <>
      <header className="App-header">
        <h1>AniDB 🎬</h1>
        <SearchBar 
          query={query}
          setQuery={setQuery}
        />
      </header>
      <main className="results-container">
        <ResultsList 
          results={results}
          isLoading={isLoading}
          searched={query.trim() !== ''} // We've "searched" if the query isn't empty
        />
      </main>
    </>
  );
};

export default SearchPage;