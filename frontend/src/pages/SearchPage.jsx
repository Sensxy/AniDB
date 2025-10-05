import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import ResultsList from '../components/ResultsList';
import Pagination from '../components/Pagination';

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // This ref helps us reset the page only when the search term itself changes
    const previousQuery = useRef(query);

    useEffect(() => {
        // If the user has typed a new search term, reset to page 1
        if (query !== previousQuery.current) {
            setCurrentPage(1);
        }
        previousQuery.current = query;

        if (query.trim() === '') {
            setResults([]);
            setTotalCount(0);
            return;
        }

        const performSearch = async () => {
            setIsLoading(true);
            try {
                // Add the 'page' parameter to the API call
                const response = await fetch(`http://127.0.0.1:5000/api/search?q=${encodeURIComponent(query)}&page=${currentPage}`);
                const data = await response.json();
                setResults(data.results);
                setTotalCount(data.total_count);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setResults([]);
                setTotalCount(0);
            }
            setIsLoading(false);
        };

        // Debounce the search
        const searchTimer = setTimeout(performSearch, 300);

        return () => clearTimeout(searchTimer);

    }, [query, currentPage]); // Re-run the effect when query OR currentPage changes

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
                    searched={query.trim() !== ''}
                />
                <Pagination
                    currentPage={currentPage}
                    totalResults={totalCount}
                    onPageChange={setCurrentPage}
                />
            </main>
        </>
    );
};

export default SearchPage;