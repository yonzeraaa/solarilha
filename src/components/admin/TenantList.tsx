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
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit'; // Optional: Add later if needed

interface Tenant {
  id: string; // User ID from profiles table
  full_name: string | null;
  email: string | null; // Need to fetch email from auth.users
  block_number: string | null;
  apartment_number: string | null;
  created_at: string;
}

// Interface combining profile and auth user data
interface TenantDisplayData extends Tenant {
    email: string; // Make email non-null for display
}


const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<TenantDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null); // Track which user is being deleted

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profiles for tenants
      // NOTE: This fetches profiles but not emails directly.
      // Fetching emails requires joining with auth.users which isn't directly possible
      // with RLS enabled in the client without potentially exposing all emails.
      // A secure way is often an Edge Function or fetching emails separately if needed.
      // For now, we'll fetch profiles and accept email might be missing initially.
      // Let's modify this to use an RPC call for security later if needed.

      // Fetch profiles first
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, block_number, apartment_number, created_at')
        .eq('role', 'tenant')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // TODO: Securely fetch corresponding emails for these user IDs.
      // This is a placeholder - a secure implementation would use an Edge Function
      // that takes the list of IDs and returns emails for only those IDs,
      // callable only by an admin.
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

  const handleDeleteTenant = async (tenantId: string, tenantName: string | null) => {
     if (!window.confirm(`Tem certeza que deseja excluir o inquilino ${tenantName || tenantId}? Esta ação é irreversível e excluirá o login e o perfil.`)) return;

     setDeleteLoading(tenantId); // Set loading state for this specific user
     setError(null);

     try {
        // IMPORTANT: Deleting a user requires admin privileges.
        // This should ideally be done via an Edge Function using the Admin Client.
        // Calling auth.admin.deleteUser directly from the client is insecure.
        // We will create an Edge Function 'delete-user' for this.

        // Placeholder for Edge Function call:
         console.log(`Attempting to delete user via Edge Function: ${tenantId}`);
         // const { error: functionError } = await supabase.functions.invoke('delete-user', {
         //   body: { userId: tenantId },
         // });
         // if (functionError) throw functionError;

         // TEMPORARY Placeholder Alert - Replace with Edge Function call
         alert(`FUNCIONALIDADE DE EXCLUSÃO (VIA EDGE FUNCTION) AINDA NÃO IMPLEMENTADA PARA O USUÁRIO: ${tenantId}`);
         // --- End of Placeholder ---


        // If Edge Function call is successful:
        // setTenants(prev => prev.filter(t => t.id !== tenantId)); // Remove from list optimistically
        // console.log(`Tenant ${tenantId} deleted successfully.`);

     } catch (err: any) {
        console.error("Error deleting tenant:", err);
        setError(`Erro ao excluir inquilino: ${err.message}`);
     } finally {
        setDeleteLoading(null); // Clear loading state
     }
  };


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Inquilinos Cadastrados</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
                  <TableCell>{tenant.email || '-'}</TableCell> {/* Display placeholder email for now */}
                  <TableCell>{tenant.block_number || '-'}</TableCell>
                  <TableCell>{tenant.apartment_number || '-'}</TableCell>
                  <TableCell>{dayjs(tenant.created_at).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell align="right">
                    {/* <Tooltip title="Editar Inquilino (Não implementado)">
                       <IconButton size="small" sx={{ mr: 1 }} disabled>
                         <EditIcon fontSize="inherit" />
                       </IconButton>
                    </Tooltip> */}
                    <Tooltip title="Excluir Inquilino">
                      <span> {/* Span needed for tooltip when button is disabled */}
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTenant(tenant.id, tenant.full_name)}
                            disabled={deleteLoading === tenant.id} // Disable only the button being processed
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
    </Box>
  );
};

export default TenantList;