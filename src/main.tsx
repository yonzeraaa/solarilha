import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import theme from './styles/theme';
import { AuthProvider } from './contexts/AuthContext'; // Keep only one import
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarProvider } from 'notistack'; // Import SnackbarProvider
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// Removed duplicate AuthProvider import
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Apply baseline styles */}
      <GlobalStyles
        styles={{
          body: {
            backgroundImage: 'linear-gradient(to bottom right, #1a237e, #263238)', // Indigo to Slate gradient
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
            margin: 0,
            minHeight: '100vh',
          },
        }}
      />
      <AuthProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}> {/* Wrap with SnackbarProvider */}
            <App />
          </SnackbarProvider>
        </LocalizationProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
