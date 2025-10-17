import { createTheme } from '@mui/material/styles';
import { tokens } from './tokens';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: tokens.colors.primary[500],
      light: tokens.colors.primary[100],
      dark: tokens.colors.primary[700],
    },
    secondary: {
      main: tokens.colors.secondary[500],
      light: tokens.colors.secondary[100],
      dark: tokens.colors.secondary[900],
    },
    background: {
      default: tokens.colors.background.default,
      paper: tokens.colors.background.paper,
    },
    text: {
      primary: tokens.colors.text.primary,
      secondary: tokens.colors.text.secondary,
    },
    divider: tokens.colors.border.light,
  },
  
  typography: {
    fontFamily: tokens.typography.fontFamily.primary,
    h1: {
      fontWeight: tokens.typography.fontWeight.bold,
      fontSize: tokens.typography.fontSize['5xl'],
      lineHeight: tokens.typography.lineHeight.tight,
    },
    h2: {
      fontWeight: tokens.typography.fontWeight.semiBold,
      fontSize: tokens.typography.fontSize['4xl'],
      lineHeight: tokens.typography.lineHeight.tight,
    },
    h3: {
      fontWeight: tokens.typography.fontWeight.semiBold,
      fontSize: tokens.typography.fontSize['3xl'],
      lineHeight: tokens.typography.lineHeight.tight,
    },
    h4: {
      fontWeight: tokens.typography.fontWeight.semiBold,
      fontSize: tokens.typography.fontSize['2xl'],
      lineHeight: tokens.typography.lineHeight.normal,
    },
    h5: {
      fontWeight: tokens.typography.fontWeight.medium,
      fontSize: tokens.typography.fontSize.xl,
      lineHeight: tokens.typography.lineHeight.normal,
    },
    h6: {
      fontWeight: tokens.typography.fontWeight.medium,
      fontSize: tokens.typography.fontSize.lg,
      lineHeight: tokens.typography.lineHeight.normal,
    },
    body1: {
      fontSize: tokens.typography.fontSize.base,
      lineHeight: tokens.typography.lineHeight.normal,
    },
    body2: {
      fontSize: tokens.typography.fontSize.sm,
      lineHeight: tokens.typography.lineHeight.normal,
    },
  },
  
  spacing: (factor: number) => `${factor * 0.25}rem`, // 4px base unit
  
  shape: {
    borderRadius: tokens.borderRadius.md,
  },
  
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.components.card.backgroundColor,
          border: tokens.components.card.border,
          borderRadius: tokens.components.card.borderRadius,
          boxShadow: tokens.shadows.none,
        },
      },
    },
    
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.components.button.borderRadius,
          textTransform: tokens.components.button.textTransform,
          fontWeight: tokens.components.button.fontWeight,
        },
        contained: {
          backgroundColor: tokens.components.button.contained.backgroundColor,
          color: tokens.components.button.contained.color,
          '&:hover': {
            backgroundColor: tokens.components.button.contained.hover.backgroundColor,
          },
        },
        outlined: {
          borderColor: tokens.components.button.outlined.borderColor,
          color: tokens.components.button.outlined.color,
          '&:hover': {
            borderColor: tokens.components.button.outlined.hover.borderColor,
            backgroundColor: tokens.components.button.outlined.hover.backgroundColor,
          },
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tokens.components.chip.borderRadius,
        },
        filled: {
          backgroundColor: tokens.components.chip.filled.backgroundColor,
          color: tokens.components.chip.filled.color,
          '&:hover': {
            backgroundColor: tokens.components.chip.filled.hover.backgroundColor,
          },
        },
      },
    },
    
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.components.table.header.backgroundColor,
        },
      },
    },
    
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          },
        },
      },
    },
    
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.components.alert.backgroundColor,
          border: tokens.components.alert.border,
          color: tokens.components.alert.color,
        },
        standardSuccess: {
          borderColor: tokens.components.alert.success.borderColor,
          '& .MuiAlert-icon': {
            color: tokens.components.alert.success.iconColor,
          },
        },
        standardError: {
          borderColor: tokens.components.alert.error.borderColor,
          '& .MuiAlert-icon': {
            color: tokens.components.alert.error.iconColor,
          },
        },
        standardInfo: {
          borderColor: tokens.components.alert.info.borderColor,
          '& .MuiAlert-icon': {
            color: tokens.components.alert.info.iconColor,
          },
        },
      },
    },
    
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.colors.background.default,
          borderBottom: `1px solid ${tokens.colors.border.light}`,
          boxShadow: tokens.shadows.none,
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.colors.background.paper,
        },
      },
    },
  },
});

// Export commonly used token values for direct use in components
export const themeTokens = {
  colors: tokens.colors,
  spacing: tokens.spacing,
  typography: tokens.typography,
  borderRadius: tokens.borderRadius,
  components: tokens.components,
} as const;
