import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import StravaLogin from './components/StravaLogin';
import StravaCallback from './components/StravaCallback';
import ActivitiesPage from './components/ActivitiesPage';
import RecommendationsPage from './components/RecommendationsPage';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
}

export default App;
