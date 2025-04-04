import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack'; // Import useSnackbar
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  // Alert, // No longer needed for general feedback
  Paper,
  Alert // Keep Alert for mismatch helper text if desired, or remove if helperText is enough
} from '@mui/material';

// const SUCCESS_MESSAGE_KEY = 'changePasswordSuccess'; // No longer needed

const ChangePasswordForm: React.FC = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar(); // Get snackbar function
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Keep error for field highlighting/helper text
  // Removed success state

  // Clear error when user types
  useEffect(() => {
      if (error && (newPassword || confirmPassword)) {
          setError(null);
      }
  }, [newPassword, confirmPassword, error]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    // setSuccess(null); // Removed

    // Basic Validation
    if (!newPassword || !confirmPassword) {
      // Use snackbar for general required field error
      enqueueSnackbar("Ambos os campos de senha são obrigatórios.", { variant: 'warning'});
      return;
    }
    if (newPassword.length < 6) {
      setError("Nova senha deve ter no mínimo 6 caracteres."); // Keep local error for helper text
      enqueueSnackbar("Nova senha deve ter no mínimo 6 caracteres.", { variant: 'warning'});
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem."); // Keep local error for helper text/highlighting
      enqueueSnackbar("As senhas não coincidem.", { variant: 'warning'});
      return;
    }
    if (!user) {
        // This case should ideally not happen due to ProtectedRoute
        enqueueSnackbar("Usuário não autenticado. Faça login novamente.", { variant: 'error'});
        return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // Use snackbar for success
      enqueueSnackbar("Senha alterada com sucesso!", { variant: 'success' });
      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      console.error("Error updating password:", err);
      // Use snackbar for API errors
      enqueueSnackbar(`Erro ao alterar senha: ${err.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: '600px', mx: 'auto' }}>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Alterar Minha Senha
          </Typography>

          {/* Removed Alert feedback area */}

          <Box sx={{ mb: 2 }}>
            <TextField
              required
              fullWidth
              name="newPassword"
              label="Nova Senha"
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              error={!!error && error.includes("mínimo 6 caracteres")} // Highlight on length error
              helperText={error && error.includes("mínimo 6 caracteres") ? error : ""} // Show length error as helper
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Nova Senha"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              error={!!error && error.includes("não coincidem")} // Highlight on mismatch error
              helperText={error && error.includes("não coincidem") ? error : ""} // Show mismatch error as helper
            />
          </Box>

          <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
              sx={{ py: 1.2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Alterar Senha'}
            </Button>
            {loading && ( <CircularProgress size={24} sx={{ color: 'primary.contrastText', position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px', }} /> )}
          </Box>
        </Box>
    </Paper>
  );
};

export default ChangePasswordForm;