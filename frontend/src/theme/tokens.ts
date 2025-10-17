// Design tokens for the Sporty application
export const tokens = {
  // Color palette
  colors: {
    // Primary colors
    primary: {
      50: '#f5f5f5',
      100: '#e0e0e0',
      500: '#ffffff',
      600: '#f0f0f0',
      700: '#e0e0e0',
      900: '#000000',
    },
    
    // Secondary colors
    secondary: {
      50: '#f5f5f5',
      100: '#e0e0e0',
      500: '#000000',
      600: '#333333',
      700: '#1a1a1a',
      800: '#111111',
      900: '#0a0a0a',
    },
    
    // Background colors
    background: {
      default: '#000000',
      paper: '#111111',
      elevated: '#1a1a1a',
      surface: '#0a0a0a',
    },
    
    // Text colors
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#666666',
    },
    
    // Border colors
    border: {
      light: '#333333',
      medium: '#555555',
      dark: '#222222',
    },
    
    // Status colors
    status: {
      success: '#4caf50',
      error: '#ff4444',
      warning: '#ff9800',
      info: '#2196f3',
    },
    
    // Interactive colors
    interactive: {
      hover: 'rgba(255, 255, 255, 0.05)',
      active: 'rgba(255, 255, 255, 0.1)',
      focus: 'rgba(255, 255, 255, 0.1)',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },
  
  // Border radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    none: 'none',
  },
  
  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
  
  // Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '900px',
    lg: '1200px',
    xl: '1536px',
  },
  
  // Component specific tokens
  components: {
    card: {
      backgroundColor: '#111111',
      border: '1px solid #333333',
      borderRadius: '12px',
      padding: '1.5rem',
    },
    button: {
      borderRadius: '8px',
      fontWeight: 500,
      textTransform: 'none',
      contained: {
        backgroundColor: '#ffffff',
        color: '#000000',
        hover: {
          backgroundColor: '#f0f0f0',
        },
      },
      outlined: {
        borderColor: '#333333',
        color: '#ffffff',
        hover: {
          borderColor: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
    chip: {
      borderRadius: '6px',
      filled: {
        backgroundColor: '#333333',
        color: '#ffffff',
        hover: {
          backgroundColor: '#444444',
        },
      },
    },
    table: {
      header: {
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
      },
      row: {
        backgroundColor: '#111111',
        hover: {
          backgroundColor: '#1a1a1a',
        },
        rest: {
          backgroundColor: '#0a0a0a',
          hover: {
            backgroundColor: '#151515',
          },
        },
      },
    },
    alert: {
      backgroundColor: '#1a1a1a',
      border: '1px solid #333333',
      color: '#ffffff',
      success: {
        borderColor: '#4caf50',
        iconColor: '#4caf50',
      },
      error: {
        borderColor: '#ff4444',
        iconColor: '#ff4444',
      },
      info: {
        borderColor: '#333333',
        iconColor: '#2196f3',
      },
    },
  },
} as const;

// Type definitions for better TypeScript support
export type ColorToken = keyof typeof tokens.colors;
export type SpacingToken = keyof typeof tokens.spacing;
export type TypographyToken = keyof typeof tokens.typography;
export type ComponentToken = keyof typeof tokens.components;
