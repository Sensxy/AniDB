import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SearchPage from './pages/SearchPage.jsx';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SearchPage />} />
        {/* You could add more pages here later! */}
      </Routes>
    </div>
  );
}

export default App;