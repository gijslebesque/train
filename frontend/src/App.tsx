import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Navigation from './components/Navigation';
import StravaLogin from './components/StravaLogin';
import StravaCallback from './components/StravaCallback';
import ActivitiesPage from './components/ActivitiesPage';
import RecommendationsPage from './components/RecommendationsPage';
import { theme } from './theme';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
