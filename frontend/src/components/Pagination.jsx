import React from 'react';

const Pagination = ({ currentPage, totalResults, onPageChange }) => {
  const resultsPerPage = 50;
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Don't show pagination if there's only one page or no results
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        &laquo; Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next &raquo;
      </button>
    </div>
  );
};

export default Pagination;