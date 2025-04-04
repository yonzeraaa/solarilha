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
  Tooltip,
  Skeleton // Import Skeleton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';

// Interface remains the same...
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

// Skeleton Row for Bills
const SkeletonRow: React.FC = () => (
    <TableRow>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" width={60} /></TableCell>
        <TableCell><Skeleton variant="text" width={80} /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell align="right">
            <Skeleton variant="circular" width={24} height={24} sx={{ display: 'inline-block', mr: 1 }} />
            <Skeleton variant="circular" width={24} height={24} sx={{ display: 'inline-block' }}/>
        </TableCell>
    </TableRow>
);


const BillList: React.FC = () => {
  const [bills, setBills] = useState<BillWithDetails[]>([]);
  const [loading, setLoading] = useState(true); // Keep this loading state
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchBills = async () => {
    // setLoading(true); // Already true initially
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc(
        'get_bills_with_details'
      );
      if (rpcError) throw rpcError;
      setBills(data || []);
    } catch (err: any) {
      console.error("Error fetching bills via RPC:", err);
      setError(`Erro ao carregar boletos: ${err.message}`);
    } finally {
      setLoading(false); // Set loading false after fetch attempt
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // handleDownload remains the same...
  const handleDownload = async (bill: BillWithDetails) => {
    setActionLoading(bill.id); setError(null);
    try {
      const { data, error: downloadError } = await supabase.storage.from('tenant-bills').download(bill.file_path);
      if (downloadError) throw downloadError;
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      const filename = bill.file_path.split('/').pop() || `boleto_${bill.reference_period || bill.id}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    } catch (err: any) { setError(`Erro ao baixar boleto: ${err.message}`); }
    finally { setActionLoading(null); }
  };

  // handleDelete remains the same...
  const handleDelete = async (bill: BillWithDetails) => {
    if (!window.confirm(`Tem certeza que deseja excluir o boleto para ${bill.full_name || bill.tenant_id} (${bill.reference_period})? Esta ação excluirá o arquivo e o registro.`)) return;
    setActionLoading(bill.id); setError(null);
    try {
      console.log(`Deleting file from storage: ${bill.file_path}`);
      const { error: storageError } = await supabase.storage.from('tenant-bills').remove([bill.file_path]);
      if (storageError) { throw new Error(`Erro ao excluir arquivo do armazenamento: ${storageError.message}`); }
      console.log("File deleted from storage.");
      console.log(`Deleting bill record from DB: ${bill.id}`);
      const { error: dbError } = await supabase.from('bills').delete().eq('id', bill.id);
      if (dbError) { throw new Error(`Erro ao excluir registro do boleto: ${dbError.message}`); }
      console.log("Bill record deleted from DB.");
      setBills(prev => prev.filter(b => b.id !== bill.id));
    } catch (err: any) { setError(err.message || 'Ocorreu um erro inesperado ao excluir o boleto.'); }
    finally { setActionLoading(null); }
  };


  // Removed initial loading check here

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Boletos Enviados</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
              {loading ? (
                 // Show Skeleton rows while loading
                 <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                 </>
              ) : bills.length === 0 ? (
                 // Show message if no bills and not loading
                 <TableRow>
                    <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" sx={{ p: 2 }}>Nenhum boleto enviado ainda.</Typography>
                    </TableCell>
                 </TableRow>
              ) : (
                 // Render actual bill rows
                bills.map((bill) => (
                  <TableRow key={bill.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}> {/* Added hover effect */}
                    <TableCell component="th" scope="row">{bill.full_name || bill.tenant_id}</TableCell>
                    <TableCell>{bill.block_number || '?'}/{bill.apartment_number || '?'}</TableCell>
                    <TableCell>{bill.reference_period || '-'}</TableCell>
                    <TableCell>{dayjs(bill.uploaded_at).format('DD/MM/YYYY HH:mm')}</TableCell>
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                       <Tooltip title={bill.file_path}><span>{bill.file_path.split('/').pop()}</span></Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Baixar Boleto">
                        <span>
                          <IconButton size="small" onClick={() => handleDownload(bill)} disabled={actionLoading === bill.id} sx={{ mr: 1 }} >
                            {actionLoading === bill.id ? <CircularProgress size={16} /> : <DownloadIcon fontSize="inherit" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Excluir Boleto">
                        <span>
                          <IconButton size="small" color="error" onClick={() => handleDelete(bill)} disabled={actionLoading === bill.id} >
                            {actionLoading === bill.id ? <CircularProgress size={16} color="inherit"/> : <DeleteIcon fontSize="inherit" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
    </Box>
  );
};

export default BillList;