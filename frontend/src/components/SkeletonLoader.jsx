import React from 'react';

// This component represents one of the gray placeholder cards
const SkeletonItem = () => (
  <li className="result-item skeleton">
    <div className="skeleton-text"></div>
    <div className="skeleton-text skeleton-meta"></div>
  </li>
);

// This component renders a list of the placeholder cards
const SkeletonLoader = ({ count = 5 }) => {
  return (
    <ul className="results-list">
      {Array.from({ length: count }, (_, i) => <SkeletonItem key={i} />)}
    </ul>
  );
};

export default SkeletonLoader;