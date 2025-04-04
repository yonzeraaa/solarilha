import React, { useState, useEffect } from 'react'; // Added useEffect
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';

const SUCCESS_MESSAGE_KEY = 'changePasswordSuccess'; // Key for sessionStorage

const ChangePasswordForm: React.FC = () => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Read initial success message from sessionStorage
  const [success, setSuccess] = useState<string | null>(() => {
      const msg = sessionStorage.getItem(SUCCESS_MESSAGE_KEY);
      sessionStorage.removeItem(SUCCESS_MESSAGE_KEY); // Clear after reading
      return msg;
  });

  // Clear success message if user starts typing again
  useEffect(() => {
      if (success && (newPassword || confirmPassword)) {
          setSuccess(null);
      }
  }, [newPassword, confirmPassword, success]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    // setSuccess(null); // Don't clear success here anymore

    if (!newPassword || !confirmPassword) {
      setError("Ambos os campos de senha são obrigatórios.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!user) {
        setError("Usuário não autenticado. Faça login novamente.");
        return;
    }

    setLoading(true);
    // setSuccess(null); // Explicit clear removed earlier

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // Store success message in sessionStorage BEFORE clearing fields
      sessionStorage.setItem(SUCCESS_MESSAGE_KEY, "Senha alterada com sucesso!");
      console.log("Success message stored in sessionStorage.");

      // Clear fields (re-enabled)
      setNewPassword('');
      setConfirmPassword('');
      // Note: setSuccess state won't be set here directly,
      // it will be picked up from sessionStorage on the next render cycle

    } catch (err: any) {
      console.error("Error updating password:", err);
      setError(`Erro ao alterar senha: ${err.message}`);
      sessionStorage.removeItem(SUCCESS_MESSAGE_KEY); // Clear success message on error
    } finally {
      setLoading(false);
      // Force a re-render IF NEEDED to pick up sessionStorage, though auth change might do it
      // This is usually not necessary as the auth state change triggers re-render
      // window.location.reload(); // Avoid this if possible
    }
  };

  // Determine message and color for feedback text
  const feedbackMessage = error || success; // Success now comes from state initialized by sessionStorage
  const feedbackColor = error ? 'error.main' : success ? 'success.main' : 'text.secondary';

  return (
    <Paper sx={{ p: 3, maxWidth: '600px', mx: 'auto' }}>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Alterar Minha Senha
          </Typography>

          {/* Feedback Text Area Below Button */}
           <Box sx={{ minHeight: '40px', mb: 2 }}> {/* Keep mb here for spacing below alerts */}
             {feedbackMessage && !error && ( // Show success message using Alert for consistency
                <Alert severity="success">{feedbackMessage}</Alert>
             )}
              {error && ( // Show error message using Alert
                <Alert severity="error">{error}</Alert>
             )}
           </Box> {/* End of New Password Box */}


          <Box sx={{ mb: 2 }}> {/* Add margin below New Password */}
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
            />
          </Box> {/* End of Confirm Password Box */}
          <Box sx={{ mb: 2 }}> {/* Add margin below Confirm Password */}
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
              error={!!error && error.includes("não coincidem")}
              helperText={error && error.includes("não coincidem") ? error : ""}
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

           {/* Feedback Text Area Removed - Using Alerts above */}
           {/* <Box sx={{ mt: 2, minHeight: '24px' }}> ... </Box> */}

        </Box>
    </Paper>
  );
};

export default ChangePasswordForm;