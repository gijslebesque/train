import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import {
  Home as HomeIcon,
  DirectionsRun as ActivitiesIcon,
  Psychology as RecommendationsIcon
} from '@mui/icons-material';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/activities', label: 'Activities', icon: <ActivitiesIcon /> },
    { path: '/recommendations', label: 'Recommendations', icon: <RecommendationsIcon /> }
  ];

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#000000',
        borderBottom: '1px solid #333333',
        boxShadow: 'none'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ minHeight: '64px' }}>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            SPORTY
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                variant={location.pathname === item.path ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  minWidth: 'auto',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  ...(location.pathname === item.path && {
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                    }
                  }),
                  ...(location.pathname !== item.path && {
                    borderColor: '#333333',
                    color: '#ffffff',
                    '&:hover': {
                      borderColor: '#ffffff',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }
                  })
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
