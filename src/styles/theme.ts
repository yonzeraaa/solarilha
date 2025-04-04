import { createTheme } from '@mui/material/styles';

// Premium Dark Theme: Deep Navy/Charcoal + Muted Gold
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d4af37', // Muted Gold
      contrastText: '#1f1f1f', // Dark text for contrast on gold
    },
    secondary: {
      main: '#90a4ae', // Cool Gray
      contrastText: '#1f1f1f',
    },
    background: {
      // Gradient will be applied via GlobalStyles
      default: '#1a237e', // Fallback default background (start of gradient)
      paper: '#2c3e50',   // Dark Slate for Paper elements
    },
    text: {
      primary: '#eceff1',   // Off-white
      secondary: '#b0bec5', // Lighter Gray
    },
    divider: '#455a64', // Slightly visible divider color
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', // Modern sans-serif
    h5: {
      fontWeight: 700, // Bolder title
      letterSpacing: '0.5px',
    },
    button: {
      textTransform: 'none', // Keep button text case as defined
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Ensure no accidental background images override color
          backgroundColor: '#2c3e50', // Dark Slate
          borderRadius: 12,
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px', // Generous padding
          boxShadow: 'none', // Remove default elevation shadow if needed
          '&:hover': {
            boxShadow: 'none', // Prevent shadow on hover if desired
          }
        },
      },
      defaultProps: {
        disableElevation: true, // Flat button style
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& label.Mui-focused': {
            color: '#d4af37', // Gold label when focused
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#455a64', // Subtle border color
            },
            '&:hover fieldset': {
              borderColor: '#90a4ae', // Gray border on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#d4af37', // Gold border when focused
            },
          },
        },
      },
    },
    MuiOutlinedInput: { // Style the input field itself
      styleOverrides: {
        root: {
          borderRadius: 8, // Match button radius
          color: '#eceff1', // Input text color
          backgroundColor: 'rgba(0, 0, 0, 0.1)', // Slightly darker input background
        },
        input: {
          padding: '14px 16px', // Adjust input padding
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#d4af37', // Gold links
          fontWeight: 500,
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#90a4ae', // Gray checkbox default
          '&.Mui-checked': {
            color: '#d4af37', // Gold when checked
          },
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#d4af37', // Gold avatar background
          color: '#1f1f1f', // Dark icon color
        }
      }
    }
  },
});

export default theme;