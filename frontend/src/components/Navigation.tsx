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
import { themeTokens } from '../theme';

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
        backgroundColor: themeTokens.colors.background.default,
        borderBottom: `1px solid ${themeTokens.colors.border.light}`,
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
              color: themeTokens.colors.text.primary,
              textDecoration: 'none',
              fontWeight: themeTokens.typography.fontWeight.bold,
              letterSpacing: '-0.02em'
            }}
          >
            TRAIN
          </Typography>
          
          <Box sx={{ display: 'flex', gap: themeTokens.spacing.sm }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                variant={location.pathname === item.path ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: themeTokens.borderRadius.md,
                  px: 2,
                  py: 1,
                  minWidth: 'auto',
                  textTransform: 'none',
                  fontWeight: themeTokens.typography.fontWeight.medium,
                  fontSize: themeTokens.typography.fontSize.sm,
                  ...(location.pathname !== item.path && {
                    backgroundColor: 'transparent',
                    color: themeTokens.colors.text.secondary,
                    borderColor: themeTokens.colors.border.light,
                    '&:hover': {
                      backgroundColor: themeTokens.colors.background.paper,
                      borderColor: themeTokens.colors.text.secondary
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
