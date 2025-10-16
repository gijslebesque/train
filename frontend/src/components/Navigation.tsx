import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '🏠 Home', icon: '🏠' },
    { path: '/activities', label: '🏃‍♂️ Activities', icon: '🏃‍♂️' },
    { path: '/recommendations', label: '🤖 Recommendations', icon: '🤖' }
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#343a40',
      padding: '1rem 0',
      marginBottom: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link
          to="/"
          style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}
        >
          🚴‍♂️ Sporty
        </Link>
        
        <div style={{
          display: 'flex',
          gap: '1rem'
        }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                color: location.pathname === item.path ? '#ffc107' : 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
