import React from 'react';
const ResultItem = ({ scene }) => {
  return (
    <li className="result-item">
      <p className="dialogue">"{scene.dialogue}"</p>
      <p className="metadata">
        <strong>{scene.series_name}</strong> - Episode {scene.episode_number} (at {scene.start_time.split(',')[0]})
      </p>
    </li>
  );
};

export default ResultItem;