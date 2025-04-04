import React, { useState, useEffect } from 'react'; // Added useEffect
import { Navigate, useLocation } from 'react-router-dom'; // Added Navigate, useLocation
import {
  Container,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Link,
  Paper,
  Avatar,
  CssBaseline,
  CircularProgress,
  Alert
} from '@mui/material';
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state
  const location = useLocation();

  // Redirect away from login page if already authenticated and not loading
  useEffect(() => {
    if (!authLoading && user) {
      // Intended destination might be in location state if redirected here
      const from = location.state?.from?.pathname || "/";
      console.log(`LoginPage: User already authenticated, redirecting to ${from}`);
      // Use Navigate component logic or navigate function if preferred
    }
  }, [user, authLoading, location]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email ou senha inválidos.");
        } else {
           setError(`Erro ao fazer login: ${signInError.message}`);
        }
        console.error('Supabase sign-in error:', signInError);
        setLoading(false);
        return;
      }

      console.log('Login successful!', data);
      // Successful login! The AuthContext state will update,
      // and the routing logic in App.tsx (RootRedirect) will handle redirection.
      // No explicit navigation needed here anymore.

    } catch (catchError: any) {
      console.error('Unexpected error during login:', catchError);
      setError(`Ocorreu um erro inesperado: ${catchError.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Redirect Logic ---
  // If auth is not loading and user exists, redirect away from login page
  if (!authLoading && user) {
    const from = location.state?.from?.pathname || "/"; // Redirect to intended destination or root
    return <Navigate to={from} replace />;
  }
  // --- End Redirect Logic ---


  // Render login form only if not authenticated or still loading auth state
  return (
    <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <CssBaseline />
      <Paper
        elevation={12}
        sx={{
          padding: { xs: 3, sm: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          borderRadius: 3,
          backgroundColor: 'rgba(66, 66, 66, 0.9)', // Dark Gray with 90% opacity
        }}
      >
        <Avatar sx={{ m: 1, width: 56, height: 56 }}>
          <LockPersonOutlinedIcon fontSize="large" sx={{ color: 'background.paper' }} />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 4, color: 'text.primary' }}>
          Acessar Plataforma
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: error ? 0 : 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Seu Email Profissional"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            InputLabelProps={{ sx: { color: 'text.secondary' } }}
            InputProps={{ sx: { color: 'text.primary' } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Sua Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ mb: 1 }}
            InputLabelProps={{ sx: { color: 'text.secondary' } }}
            InputProps={{ sx: { color: 'text.primary' } }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                  disabled={loading}
                />
              }
              label={<Typography variant="body2" sx={{ color: 'text.secondary' }}>Lembrar Acesso</Typography>}
              sx={{ mr: 'auto' }}
            />
            <Link href="#" variant="body2" sx={{ opacity: loading ? 0.5 : 1 }}>
              Esqueceu a senha?
            </Link>
          </Box>

          <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
             <Button
               type="submit"
               fullWidth
               variant="contained"
               color="primary"
               disabled={loading}
               sx={{ py: 1.5 }}
             >
               {loading ? 'Entrando...' : 'Entrar'}
             </Button>
             {loading && (
               <CircularProgress
                 size={24}
                 sx={{
                   color: 'primary.contrastText',
                   position: 'absolute',
                   top: '50%',
                   left: '50%',
                   marginTop: '-12px',
                   marginLeft: '-12px',
                 }}
               />
             )}
           </Box>

          <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 4 }}>
            Se você ainda não possui as credenciais cadastradas,
            <br />
            por favor entre em contato com um administrador.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
