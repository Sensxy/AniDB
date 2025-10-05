import React from 'react';
import ResultItem from './ResultItem';
import SkeletonLoader from './SkeletonLoader';

const ResultsList = ({ results, isLoading, searched }) => {
  if (isLoading) {
    return <SkeletonLoader />;
  }
  if (searched && results.length === 0) {
    return <p>No results found.</p>;
  }
  return (
    <ul className="results-list">
      {results.map((scene, index) => (
        <ResultItem key={index} scene={scene} />
      ))}
    </ul>
  );
};

export default ResultsList;