import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import ResultsList from '../components/ResultsList';
import Pagination from '../components/Pagination';
import FilterBar from '../components/FilterBar'; // 1. Import the new component

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // --- New State for Filters ---
    const [seriesList, setSeriesList] = useState([]);
    const [selectedSeries, setSelectedSeries] = useState('');
    const [episodeFilter, setEpisodeFilter] = useState('');
    
    const previousQuery = useRef(query);

    // Effect to fetch the list of series once, on page load
    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/series');
                const data = await response.json();
                setSeriesList(data);
            } catch (error) {
                console.error("Error fetching series list:", error);
            }
        };
        fetchSeries();
    }, []); // Empty array means this runs only once

    // Main search effect
    useEffect(() => {
        if (query !== previousQuery.current) {
            setCurrentPage(1);
        }
        previousQuery.current = query;

        // Don't search if the main query is empty
        if (query.trim() === '') {
            setResults([]);
            setTotalCount(0);
            return;
        }

        const performSearch = async () => {
            setIsLoading(true);
            // Build the query string with all parameters
            const params = new URLSearchParams({
                q: query,
                page: currentPage,
            });
            if (selectedSeries) params.append('series', selectedSeries);
            if (episodeFilter) params.append('episode', episodeFilter);

            try {
                const response = await fetch(`http://127.0.0.1:5000/api/search?${params.toString()}`);
                const data = await response.json();
                setResults(data.results);
                setTotalCount(data.total_count);
            } catch (error) {
                console.error("Error fetching search results:", error);
            }
            setIsLoading(false);
        };
        
        const searchTimer = setTimeout(performSearch, 300);
        return () => clearTimeout(searchTimer);

    }, [query, currentPage, selectedSeries, episodeFilter]); // Re-run on filter change

    return (
        <>
            <header className="App-header">
                <h1>AniDB 🎬</h1>
                <SearchBar 
                    query={query}
                    setQuery={setQuery}
                />
                {/* 2. Render the new FilterBar component */}
                <FilterBar
                    seriesList={seriesList}
                    selectedSeries={selectedSeries}
                    setSelectedSeries={setSelectedSeries}
                    episodeFilter={episodeFilter}
                    setEpisodeFilter={setEpisodeFilter}
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