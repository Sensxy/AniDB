import React from 'react';

const SearchBar = ({ query, setQuery }) => {
  return (
    <div className="search-form">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Start typing to search..."
        className="search-input"
        autoFocus
      />
    </div>
  );
};

export default SearchBar;