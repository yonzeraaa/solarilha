import React, { useState } from 'react';
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
  CircularProgress, // Added for loading indicator
  Alert // Added for error messages
} from '@mui/material';
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined';
import { supabase } from '../services/supabaseClient'; // Import Supabase client

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // Note: Supabase handles sessions, 'rememberMe' might need custom logic if required beyond session persistence
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Provide more specific error messages if possible
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email ou senha inválidos.");
        } else {
           setError(`Erro ao fazer login: ${signInError.message}`);
        }
        console.error('Supabase sign-in error:', signInError);
        setLoading(false);
        return; // Stop execution if there's an error
      }

      // Handle successful login
      console.log('Login successful!', data);
      // TODO: Redirect user based on role (Admin/Tenant) after fetching profile or session data
      alert('Login bem-sucedido! (Redirecionamento ainda não implementado)');
      // Example: navigate('/dashboard'); // Requires react-router-dom's useNavigate hook

    } catch (catchError: any) {
      console.error('Unexpected error during login:', catchError);
      setError(`Ocorreu um erro inesperado: ${catchError.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false); // Ensure loading is turned off
    }
  };

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
        }}
      >
        <Avatar sx={{ m: 1, width: 56, height: 56 }}>
          <LockPersonOutlinedIcon fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 4, color: 'text.primary' }}>
          Acessar Plataforma
        </Typography>

        {/* Display Error Alert */}
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
            disabled={loading} // Disable input while loading
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
            disabled={loading} // Disable input while loading
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
                  disabled={loading} // Disable checkbox while loading
                />
              }
              label={<Typography variant="body2" sx={{ color: 'text.secondary' }}>Lembrar Acesso</Typography>}
              sx={{ mr: 'auto' }}
            />
            <Link href="#" variant="body2" sx={{ opacity: loading ? 0.5 : 1 }}> {/* Dim link when loading */}
              Esqueceu a senha?
            </Link>
          </Box>

          <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
             <Button
               type="submit"
               fullWidth
               variant="contained"
               color="primary"
               disabled={loading} // Disable button while loading
               sx={{ py: 1.5 }}
             >
               {loading ? 'Entrando...' : 'Entrar'}
             </Button>
             {loading && (
               <CircularProgress
                 size={24}
                 sx={{
                   color: 'primary.contrastText', // Match button text color
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
