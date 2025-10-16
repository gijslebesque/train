import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import StravaLogin from './components/StravaLogin';
import StravaCallback from './components/StravaCallback';
import ActivitiesPage from './components/ActivitiesPage';
import RecommendationsPage from './components/RecommendationsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<StravaLogin />} />
          <Route path="/callback" element={<StravaCallback />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
