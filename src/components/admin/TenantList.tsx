import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs'; // Import dayjs
import { supabase } from '../../services/supabaseClient';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset'; // Icon for password reset

interface Tenant {
  id: string;
  full_name: string | null;
  email: string | null;
  block_number: string | null;
  apartment_number: string | null;
  created_at: string;
}

interface TenantDisplayData extends Tenant {
    email: string;
}

// Interface for the user being targeted for password reset
interface TargetUser {
    id: string;
    name: string | null;
}

const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<TenantDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // For general success messages
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState<string | null>(null); // Loading state for password reset
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [targetUser, setTargetUser] = useState<TargetUser | null>(null); // User whose password will be reset
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null); // Specific error for reset dialog

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, block_number, apartment_number, created_at')
        .eq('role', 'tenant')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Placeholder for fetching emails securely later
      const tenantData: TenantDisplayData[] = profilesData?.map(p => ({
          ...p,
          email: `user_${p.id.substring(0, 5)}@example.com` // Placeholder email
      })) || [];

      setTenants(tenantData);

    } catch (err: any) {
      console.error("Error fetching tenants:", err);
      setError(`Erro ao carregar inquilinos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // --- Delete Logic ---
  const handleDeleteTenant = async (tenantId: string, tenantName: string | null) => {
     if (!window.confirm(`Tem certeza que deseja excluir o inquilino ${tenantName || tenantId}? Esta ação é irreversível.`)) return;
     setDeleteLoading(tenantId);
     setError(null);
     setSuccess(null);
     try {
        console.log(`Invoking delete-user function for: ${tenantId}`);
        const { error: functionError } = await supabase.functions.invoke('delete-user', {
          body: JSON.stringify({ userId: tenantId }),
          method: 'POST',
        });
        if (functionError) {
           let message = functionError.message;
           try {
               const context = JSON.parse(functionError.context || '{}');
               if (context.error) message = context.error;
           } catch(e) { /* Ignore parsing error */ }
           console.error('Error invoking delete-user function:', functionError);
           throw new Error(`Erro ao excluir inquilino: ${message}`);
        }
        setTenants(prev => prev.filter(t => t.id !== tenantId));
        setSuccess(`Inquilino ${tenantName || tenantId} excluído com sucesso.`);
        console.log(`Tenant ${tenantId} deleted successfully.`);
     } catch (err: any) {
        console.error("Error deleting tenant:", err);
        setError(`Erro ao excluir inquilino: ${err.message}`);
     } finally {
        setDeleteLoading(null);
     }
  };

  // --- Password Reset Logic ---
  const handleOpenResetDialog = (user: TargetUser) => {
    setTargetUser(user);
    setNewPassword(''); // Clear previous password attempt
    setResetError(null); // Clear previous errors
    setOpenResetDialog(true);
  };

  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setTargetUser(null); // Clear target user
  };

  const handlePasswordReset = async () => {
    if (!targetUser || !newPassword) {
        setResetError("Nova senha não pode estar vazia.");
        return;
    }
     if (newPassword.length < 6) {
         setResetError("Senha deve ter no mínimo 6 caracteres.");
         return;
     }

    setResetLoading(targetUser.id);
    setResetError(null);
    setError(null); // Clear main error
    setSuccess(null); // Clear main success

    try {
        console.log(`Invoking reset-tenant-password function for: ${targetUser.id}`);
        const { error: functionError } = await supabase.functions.invoke('reset-tenant-password', {
          body: JSON.stringify({ userId: targetUser.id, newPassword: newPassword }),
          method: 'POST',
        });

        if (functionError) {
           let message = functionError.message;
           try {
               const context = JSON.parse(functionError.context || '{}');
               if (context.error) message = context.error;
           } catch(e) { /* Ignore parsing error */ }
           console.error('Error invoking reset-tenant-password function:', functionError);
           throw new Error(message); // Throw specific error message
        }

        setSuccess(`Senha para ${targetUser.name || targetUser.id} redefinida com sucesso.`);
        handleCloseResetDialog(); // Close dialog on success

    } catch (err: any) {
        console.error("Error resetting password:", err);
        setResetError(`Erro ao redefinir senha: ${err.message}`); // Show error inside dialog
    } finally {
        setResetLoading(null);
    }
  };


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Inquilinos Cadastrados</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>} {/* Show general success */}

      {tenants.length === 0 && !loading && !error && (
        <Typography color="text.secondary">Nenhum inquilino cadastrado ainda.</Typography>
      )}
      {tenants.length > 0 && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome Completo</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Bloco</TableCell>
                <TableCell>Apto</TableCell>
                <TableCell>Cadastrado em</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow
                  key={tenant.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {tenant.full_name || '-'}
                  </TableCell>
                  <TableCell>{tenant.email || '-'}</TableCell>
                  <TableCell>{tenant.block_number || '-'}</TableCell>
                  <TableCell>{tenant.apartment_number || '-'}</TableCell>
                  <TableCell>{dayjs(tenant.created_at).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Redefinir Senha">
                       <span>
                         <IconButton
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() => handleOpenResetDialog({ id: tenant.id, name: tenant.full_name })}
                            disabled={resetLoading === tenant.id || deleteLoading === tenant.id}
                         >
                           {resetLoading === tenant.id ? <CircularProgress size={16} /> : <LockResetIcon fontSize="inherit" />}
                         </IconButton>
                       </span>
                    </Tooltip>
                    <Tooltip title="Excluir Inquilino">
                      <span>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTenant(tenant.id, tenant.full_name)}
                            disabled={deleteLoading === tenant.id || resetLoading === tenant.id}
                        >
                          {deleteLoading === tenant.id ? <CircularProgress size={16} color="inherit"/> : <DeleteIcon fontSize="inherit" />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Password Reset Dialog */}
      <Dialog open={openResetDialog} onClose={handleCloseResetDialog}>
        <DialogTitle>Redefinir Senha para {targetUser?.name || targetUser?.id}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Digite a nova senha para este inquilino. Eles precisarão usar esta nova senha para fazer login.
          </DialogContentText>
          {resetError && <Alert severity="error" sx={{ mb: 2 }}>{resetError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            id="newPassword"
            label="Nova Senha"
            type="password"
            fullWidth
            variant="standard"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!resetError} // Highlight field if there's a reset error
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog} disabled={!!resetLoading}>Cancelar</Button>
          <Button
            onClick={handlePasswordReset}
            disabled={!newPassword || newPassword.length < 6 || !!resetLoading}
            variant="contained"
          >
            {resetLoading === targetUser?.id ? <CircularProgress size={20} color="inherit"/> : "Redefinir Senha"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default TenantList;