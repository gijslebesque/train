import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StravaLogin from './components/StravaLogin';
import StravaCallback from './components/StravaCallback';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<StravaLogin />} />
          <Route path="/callback" element={<StravaCallback />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
