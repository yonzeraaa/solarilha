import { createTheme } from '@mui/material/styles';

// Define the custom color palette for dark mode (Teal & Amber)
const theme = createTheme({
  palette: {
    mode: 'light', // Switch to light mode
    primary: {
      main: '#1976d2', // Keep Vibrant Blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e0e0e0', // Lighter Gray for accents on dark paper
      contrastText: '#000000',
    },
    background: {
      default: '#e3f2fd', // Light Blue background for the page
      paper: '#424242',   // Dark Gray ("cinza chumbo") for Paper elements (forms)
    },
    // Text colors optimized for the dark paper background
    text: {
      primary: '#f5f5f5',   // Very Light Gray for primary text on dark paper
      secondary: '#bdbdbd', // Light Gray for secondary text on dark paper
    },
  },
  typography: {
    // Customize font families, sizes, etc. here if needed
    // fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600, // Make the title slightly bolder
    }
  },
  components: {
    // Example component overrides for a more refined look
    MuiPaper: { // Ensure Paper uses the dark background and light text
      styleOverrides: {
        root: {
          // backgroundColor: '#424242', // Removed explicit background override
          color: '#f5f5f5', // Keep explicit light primary text color for dark paper
          // Slightly more rounded corners for the login box
          borderRadius: 12,
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded buttons
          textTransform: 'none', // Prevent uppercase transform
          padding: '10px 20px', // Slightly larger button padding
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // Use outlined variant for text fields
      },
      styleOverrides: {
        root: {
          // Add some margin bottom by default
          marginBottom: '1rem',
        }
      }
    },
    MuiLink: { // Links will be on the dark paper, use a light color
      styleOverrides: {
        root: {
          color: '#90caf9', // Lighter blue suitable for dark background
          fontWeight: 500,
        }
      }
    }
  },
});

export default theme;