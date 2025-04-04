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
  Grid // Using Grid for layout flexibility
} from '@mui/material';
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined'; // Changed icon

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
    <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <CssBaseline />
      <Paper
        elevation={12} // Increased elevation for more depth
        sx={{
          padding: { xs: 3, sm: 5 }, // Responsive padding
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          borderRadius: 3, // Slightly less rounded corners
          // backgroundColor is set via theme MuiPaper override
        }}
      >
        <Avatar sx={{ m: 1, width: 56, height: 56 }}> {/* Larger Avatar */}
          {/* Icon color is set via theme MuiAvatar override */}
          <LockPersonOutlinedIcon fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 4, color: 'text.primary' }}> {/* Increased margin */}
          Acessar Solar da Ilha
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Seu Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Styling handled by theme overrides
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
            // Styling handled by theme overrides
            sx={{ mb: 1 }} // Reduced margin below password
          />
          {/* Replaced Grid with Box/Flexbox due to persistent TS errors */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  // Color handled by theme override
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2" sx={{ color: 'text.secondary' }}>Lembrar Acesso</Typography>}
              sx={{ mr: 'auto' }} // Keep checkbox pushed left
            />
            <Link href="#" variant="body2"> {/* Color handled by theme override */}
              Esqueceu a senha?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary" // Use primary (gold) color
            sx={{ mt: 3, mb: 2, py: 1.5 }} // Adjusted padding/margins
          >
            Entrar
          </Button>

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
