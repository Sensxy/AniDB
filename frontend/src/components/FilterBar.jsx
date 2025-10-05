import React from 'react';

const FilterBar = ({ seriesList, selectedSeries, setSelectedSeries, episodeFilter, setEpisodeFilter }) => {
  return (
    <div className="filter-bar">
      <select value={selectedSeries} onChange={(e) => setSelectedSeries(e.target.value)}>
        <option value="">All Series</option>
        {seriesList.map(series => (
          <option key={series} value={series}>{series}</option>
        ))}
      </select>
      <input
        type="number"
        value={episodeFilter}
        onChange={(e) => setEpisodeFilter(e.target.value)}
        placeholder="Episode #"
      />
    </div>
  );
};

export default FilterBar;