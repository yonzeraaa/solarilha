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
  Avatar, // Added for icon
  CssBaseline // Ensure consistent baseline
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Import lock icon

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Implement login logic with Supabase
    console.log({
      email,
      password,
      rememberMe,
    });
    alert('Login logic not yet implemented.');
  };

  return (
    // Use Container to constrain width and center, Box for flex layout
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <CssBaseline /> {/* Ensure baseline styles are applied */}
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          backgroundColor: 'rgba(66, 66, 66, 0.9)', // Dark Gray with 90% opacity
          // Add backdrop filter for a frosted glass effect (optional, browser support varies)
          // backdropFilter: 'blur(5px)',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> {/* Light Gray background for avatar */}
          {/* Set icon color to contrast with light gray avatar bg */}
          <LockOutlinedIcon sx={{ color: 'background.paper' }} />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}> {/* Increased margin bottom */}
          Solar da Ilha
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal" // Keep normal margin for spacing
            required
            fullWidth
            id="email"
            label="Endereço de Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Ensure input/label colors are light against dark paper
            InputLabelProps={{ sx: { color: 'text.secondary' } }}
            InputProps={{ sx: { color: 'text.primary' } }}
            // variant="outlined" // Default is set in theme
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // Ensure input/label colors are light against dark paper
            InputLabelProps={{ sx: { color: 'text.secondary' } }}
            InputProps={{ sx: { color: 'text.primary' } }}
            // variant="outlined" // Default is set in theme
            sx={{ mb: 2 }} // Add some margin below password
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary" // Use primary (teal) color for checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Lembrar-me</Typography>}
            />
             <Link href="#" variant="body2"> {/* color="secondary" is set in theme */}
               Esqueceu a sua senha?
             </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary" // Use primary (teal) color
            sx={{ mt: 2, mb: 2, py: 1.2 }} // Adjusted padding/margins
          >
            Entrar
          </Button>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            Se você ainda não possui as credenciais cadastradas, por favor entre em contato com algum administrador.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;