import type { SxProps, Theme } from '@mui/material/styles';
import { themeTokens } from './theme';

// Common styling patterns using design tokens
export const commonStyles = {
  // Card styles
  card: {
    backgroundColor: themeTokens.colors.background.paper,
    border: `1px solid ${themeTokens.colors.border.light}`,
    borderRadius: themeTokens.borderRadius.lg,
    padding: themeTokens.spacing.lg,
  } as SxProps<Theme>,
  
  cardElevated: {
    backgroundColor: themeTokens.colors.background.elevated,
    border: `1px solid ${themeTokens.colors.border.light}`,
    borderRadius: themeTokens.borderRadius.lg,
    padding: themeTokens.spacing.lg,
  } as SxProps<Theme>,
  
  // Button styles
  buttonPrimary: {
    backgroundColor: themeTokens.components.button.contained.backgroundColor,
    color: themeTokens.components.button.contained.color,
    '&:hover': {
      backgroundColor: themeTokens.components.button.contained.hover.backgroundColor,
    },
  } as SxProps<Theme>,
  
  buttonSecondary: {
    borderColor: themeTokens.components.button.outlined.borderColor,
    color: themeTokens.components.button.outlined.color,
    '&:hover': {
      borderColor: themeTokens.components.button.outlined.hover.borderColor,
      backgroundColor: themeTokens.components.button.outlined.hover.backgroundColor,
    },
  } as SxProps<Theme>,
  
  // Text styles
  textPrimary: {
    color: themeTokens.colors.text.primary,
  } as SxProps<Theme>,
  
  textSecondary: {
    color: themeTokens.colors.text.secondary,
  } as SxProps<Theme>,
  
  // Layout styles
  container: {
    marginTop: themeTokens.spacing['3xl'],
    marginBottom: themeTokens.spacing.xl,
  } as SxProps<Theme>,
  
  containerWithNav: {
    marginTop: '80px', // Account for fixed AppBar height
    marginBottom: themeTokens.spacing.xl,
  } as SxProps<Theme>,
  
  section: {
    marginBottom: themeTokens.spacing.xl,
  } as SxProps<Theme>,
  
  // Table styles
  tableHeader: {
    backgroundColor: themeTokens.components.table.header.backgroundColor,
    color: themeTokens.components.table.header.color,
    fontWeight: themeTokens.typography.fontWeight.semiBold,
  } as SxProps<Theme>,
  
  tableRow: {
    backgroundColor: themeTokens.components.table.row.backgroundColor,
    '&:hover': {
      backgroundColor: themeTokens.components.table.row.hover.backgroundColor,
    },
  } as SxProps<Theme>,
  
  tableRowRest: {
    backgroundColor: themeTokens.components.table.row.rest.backgroundColor,
    '&:hover': {
      backgroundColor: themeTokens.components.table.row.rest.hover.backgroundColor,
    },
  } as SxProps<Theme>,
  
  // Chip styles
  chipDefault: {
    backgroundColor: themeTokens.components.chip.filled.backgroundColor,
    color: themeTokens.components.chip.filled.color,
    '&:hover': {
      backgroundColor: themeTokens.components.chip.filled.hover.backgroundColor,
    },
  } as SxProps<Theme>,
  
  chipActive: {
    backgroundColor: themeTokens.colors.primary[500],
    color: themeTokens.colors.secondary[500],
    '&:hover': {
      backgroundColor: themeTokens.colors.primary[600],
    },
  } as SxProps<Theme>,
  
  // Alert styles
  alertSuccess: {
    backgroundColor: themeTokens.components.alert.backgroundColor,
    border: `1px solid ${themeTokens.components.alert.success.borderColor}`,
    color: themeTokens.components.alert.color,
    '& .MuiAlert-icon': {
      color: themeTokens.components.alert.success.iconColor,
    },
  } as SxProps<Theme>,
  
  alertError: {
    backgroundColor: themeTokens.components.alert.backgroundColor,
    border: `1px solid ${themeTokens.components.alert.error.borderColor}`,
    color: themeTokens.components.alert.color,
    '& .MuiAlert-icon': {
      color: themeTokens.components.alert.error.iconColor,
    },
  } as SxProps<Theme>,
  
  alertInfo: {
    backgroundColor: themeTokens.components.alert.backgroundColor,
    border: `1px solid ${themeTokens.components.alert.info.borderColor}`,
    color: themeTokens.components.alert.color,
    '& .MuiAlert-icon': {
      color: themeTokens.components.alert.info.iconColor,
    },
  } as SxProps<Theme>,
} as const;

// Utility functions for common patterns
export const getSpacing = (size: keyof typeof themeTokens.spacing) => themeTokens.spacing[size];
export const getColor = (color: keyof typeof themeTokens.colors) => themeTokens.colors[color];
export const getTypography = (type: keyof typeof themeTokens.typography) => themeTokens.typography[type];

// Helper function to create consistent spacing
export const spacing = (multiplier: number) => `${multiplier * 0.25}rem`;

// Helper function to create consistent border radius
export const borderRadius = (size: keyof typeof themeTokens.borderRadius) => themeTokens.borderRadius[size];
