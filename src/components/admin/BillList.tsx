import React, { useState, useEffect } from 'react';
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
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';

// Interface matching the RPC function return structure
interface BillWithDetails {
  id: number;
  file_path: string;
  reference_period: string | null;
  uploaded_at: string;
  tenant_id: string;
  full_name: string | null;
  block_number: string | null;
  apartment_number: string | null;
}

const BillList: React.FC = () => {
  const [bills, setBills] = useState<BillWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // For delete/download

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Calling RPC function get_bills_with_details...");
      const { data, error: rpcError } = await supabase.rpc(
        'get_bills_with_details'
      );

      if (rpcError) throw rpcError;

      console.log("Fetched bill data via RPC:", data);
      setBills(data || []);

    } catch (err: any) {
      console.error("Error fetching bills via RPC:", err);
      setError(`Erro ao carregar boletos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleDownload = async (bill: BillWithDetails) => {
    setActionLoading(bill.id);
    setError(null);
    try {
      const { data, error: downloadError } = await supabase.storage
        .from('tenant-bills')
        .download(bill.file_path);

      if (downloadError) throw downloadError;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      const filename = bill.file_path.split('/').pop() || `boleto_${bill.reference_period || bill.id}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error("Error downloading bill:", err);
      setError(`Erro ao baixar boleto: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (bill: BillWithDetails) => {
    if (!window.confirm(`Tem certeza que deseja excluir o boleto para ${bill.full_name || bill.tenant_id} (${bill.reference_period})? Esta ação excluirá o arquivo e o registro.`)) return;

    setActionLoading(bill.id);
    setError(null);
    try {
      // 1. Delete the file from storage
      console.log(`Deleting file from storage: ${bill.file_path}`);
      const { error: storageError } = await supabase.storage
        .from('tenant-bills')
        .remove([bill.file_path]); // Pass path in an array

      if (storageError) {
         // Log error but proceed to delete DB record anyway? Or stop?
         // Let's stop for now if storage delete fails.
         console.error("Error deleting file from storage:", storageError);
         throw new Error(`Erro ao excluir arquivo do armazenamento: ${storageError.message}`);
      }
      console.log("File deleted from storage.");

      // 2. Delete the record from the database
      console.log(`Deleting bill record from DB: ${bill.id}`);
      const { error: dbError } = await supabase
        .from('bills')
        .delete()
        .eq('id', bill.id);

      if (dbError) {
        console.error("Error deleting bill record from DB:", dbError);
        // File was deleted but DB record remains - potential inconsistency
        throw new Error(`Erro ao excluir registro do boleto: ${dbError.message}`);
      }
      console.log("Bill record deleted from DB.");

      // 3. Refresh list on success
      setBills(prev => prev.filter(b => b.id !== bill.id)); // Optimistic update

    } catch (err: any) {
      console.error("Error deleting bill:", err);
      setError(err.message || 'Ocorreu um erro inesperado ao excluir o boleto.');
      // Optionally refetch list on error to ensure consistency
      // fetchBills();
    } finally {
      setActionLoading(null);
    }
  };


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Boletos Enviados</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {bills.length === 0 && !loading && !error && (
        <Typography color="text.secondary">Nenhum boleto enviado ainda.</Typography>
      )}
      {bills.length > 0 && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="uploaded bills table" size="small">
            <TableHead>
              <TableRow>
                <TableCell>Inquilino</TableCell>
                <TableCell>Bloco/Apto</TableCell>
                <TableCell>Período Ref.</TableCell>
                <TableCell>Data Envio</TableCell>
                <TableCell>Arquivo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.map((bill) => (
                <TableRow
                  key={bill.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {bill.full_name || bill.tenant_id}
                  </TableCell>
                  <TableCell>{bill.block_number || '?'}/{bill.apartment_number || '?'}</TableCell>
                  <TableCell>{bill.reference_period || '-'}</TableCell>
                  <TableCell>{dayjs(bill.uploaded_at).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                     <Tooltip title={bill.file_path}>
                        <span>{bill.file_path.split('/').pop()}</span>
                     </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Baixar Boleto">
                      <span>
                        <IconButton
                            size="small"
                            onClick={() => handleDownload(bill)}
                            disabled={actionLoading === bill.id}
                            sx={{ mr: 1 }}
                        >
                          {actionLoading === bill.id ? <CircularProgress size={16} /> : <DownloadIcon fontSize="inherit" />}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Excluir Boleto">
                      <span>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(bill)}
                            disabled={actionLoading === bill.id}
                        >
                          {actionLoading === bill.id ? <CircularProgress size={16} color="inherit"/> : <DeleteIcon fontSize="inherit" />}
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

export default BillList;