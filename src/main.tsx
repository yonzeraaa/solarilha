import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles'; // Import GlobalStyles
import theme from './styles/theme'; // Import the custom theme
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
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
      <AuthProvider> {/* Wrap App with AuthProvider */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
