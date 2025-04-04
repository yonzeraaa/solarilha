import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors'; // Import grey color

// Premium Dark Theme: Deep Navy/Charcoal + Muted Gold
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d4af37', // Muted Gold
      contrastText: '#1f1f1f',
    },
    secondary: {
      main: '#90a4ae', // Cool Gray
      contrastText: '#1f1f1f',
    },
    background: {
      // Gradient applied via GlobalStyles
      default: '#1a237e', // Fallback default (start of gradient)
      paper: '#2c3e50',   // Dark Slate for Paper elements
    },
    text: {
      primary: '#eceff1',   // Off-white
      secondary: '#b0bec5', // Lighter Gray
    },
    divider: 'rgba(255, 255, 255, 0.12)', // Standard dark divider
    action: {
        // Adjust hover/selected opacities if needed
        // hover: 'rgba(255, 255, 255, 0.08)',
        // selected: 'rgba(255, 255, 255, 0.16)',
    }
  },
  shape: {
    borderRadius: 8, // Consistent border radius
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
      letterSpacing: '0.5px',
      marginBottom: '1rem', // Add some default bottom margin
    },
     h6: {
      fontWeight: 600,
      letterSpacing: '0.25px',
      marginBottom: '0.75rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    body1: {
        color: '#eceff1', // Ensure body1 uses primary text color
    },
    body2: {
        color: '#b0bec5', // Ensure body2 uses secondary text color
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#2c3e50',
          // borderRadius: 12, // Use theme default shape.borderRadius
        }
      },
      defaultProps: {
          elevation: 3, // Default elevation for Paper
      }
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                // Use a slightly different paper color for AppBar if desired
                // backgroundColor: '#34495e',
            }
        },
        defaultProps: {
            elevation: 1, // Low elevation for AppBar
        }
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                 backgroundColor: '#2c3e50', // Match Paper background
                 borderRight: '1px solid rgba(255, 255, 255, 0.12)', // Use theme divider color
            }
        }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          // borderRadius: 8, // Use theme default
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        },
        containedPrimary: { // Style primary buttons specifically
            // Example: Add subtle gradient or different hover
            // '&:hover': {
            //     backgroundColor: '#c8a02f', // Slightly darker gold on hover
            // }
        }
      },
      defaultProps: {
        disableElevation: true,
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small', // Use smaller text fields by default
        margin: 'normal', // Add normal margin by default
      },
      styleOverrides: {
        root: {
          '& label.Mui-focused': {
            color: '#d4af37',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)', // Standard dark outlined border
            },
            '&:hover fieldset': {
              borderColor: '#90a4ae',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#d4af37',
              borderWidth: '1px', // Ensure border width doesn't jump on focus
            },
             backgroundColor: 'rgba(0, 0, 0, 0.15)', // Slightly darker input background
             borderRadius: 8, // Match theme shape
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // borderRadius: 8, // Use theme default
          color: '#eceff1',
          // backgroundColor: 'rgba(0, 0, 0, 0.1)', // Moved to TextField override
        },
        input: {
          padding: '10.5px 14px', // Adjust padding for 'small' size
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#d4af37',
          fontWeight: 500,
          textDecorationColor: 'rgba(212, 175, 55, 0.4)', // Subtle underline color
           '&:hover': {
                textDecorationColor: '#d4af37', // Brighter underline on hover
           }
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#90a4ae',
          '&.Mui-checked': {
            color: '#d4af37',
          },
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#d4af37',
          color: '#1f1f1f',
        }
      }
    },
    MuiTooltip: {
        styleOverrides: {
            tooltip: {
                backgroundColor: grey[700], // Darker tooltip background
                fontSize: '0.75rem',
            },
            arrow: {
                color: grey[700],
            }
        },
        defaultProps: {
            arrow: true, // Add arrow by default
        }
    },
    MuiTableCell: {
        styleOverrides: {
            head: {
                fontWeight: 600, // Bolder table headers
                color: '#eceff1', // Ensure header text is primary
            },
            body: {
                 color: '#b0bec5', // Use secondary text color for body cells
            }
        }
    },
    MuiListItemButton: { // Style NavLink hover/selected via inner button
        styleOverrides: {
            root: {
                 '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Standard hover
                 },
                 // Selected state handled by NavLink style prop now
                 // '&.Mui-selected': {
                 //    backgroundColor: 'rgba(212, 175, 55, 0.16)', // Example selected gold tint
                 //    '&:hover': {
                 //       backgroundColor: 'rgba(212, 175, 55, 0.24)',
                 //    }
                 // }
            }
        }
    }
  },
});

export default theme;