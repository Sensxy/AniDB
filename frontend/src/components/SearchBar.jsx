import React from 'react';

const SearchBar = ({ query, setQuery, handleSearch, isLoading }) => {
  return (
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
  );
};

export default SearchBar;