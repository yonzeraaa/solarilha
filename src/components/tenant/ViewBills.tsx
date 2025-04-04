import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs'; // Import dayjs
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Paper // Added Paper for styling list
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description'; // Icon for PDF
import DownloadIcon from '@mui/icons-material/Download';

interface Bill {
  id: number;
  file_path: string;
  reference_period: string | null;
  uploaded_at: string;
}

const ViewBills: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null); // Track which bill is downloading

  useEffect(() => {
    const fetchBills = async () => {
      if (!user) return; // Should not happen if protected route works

      setLoading(true);
      setError(null);
      try {
        // Fetch bills for the current tenant using RLS
        const { data, error: fetchError } = await supabase
          .from('bills')
          .select('id, file_path, reference_period, uploaded_at')
          .eq('tenant_id', user.id) // RLS policy allows this
          .order('reference_period', { ascending: false }); // Show newest first

        if (fetchError) throw fetchError;

        setBills(data || []);

      } catch (err: any) {
        console.error("Error fetching bills:", err);
        setError(`Erro ao carregar boletos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [user]); // Refetch if user changes (shouldn't happen within dashboard)

  const handleDownload = async (bill: Bill) => {
    setDownloading(bill.id);
    setError(null);
    try {
      const { data, error: downloadError } = await supabase.storage
        .from('tenant-bills') // Bucket name
        .download(bill.file_path); // Path stored in the bills table

      if (downloadError) throw downloadError;

      // Create a URL for the downloaded blob and trigger download
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      // Extract filename from path or use a generic name
      const filename = bill.file_path.split('/').pop() || `boleto_${bill.reference_period || bill.id}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error("Error downloading bill:", err);
      setError(`Erro ao baixar boleto: ${err.message}`);
    } finally {
      setDownloading(null);
    }
  };


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Meus Boletos</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {bills.length === 0 && !loading && !error && (
        <Typography color="text.secondary">Nenhum boleto disponível no momento.</Typography>
      )}

      {bills.length > 0 && (
         <Paper sx={{ mt: 2 }}> {/* Wrap list in Paper */}
            <List>
              {bills.map((bill) => (
                <ListItem
                  key={bill.id}
                  secondaryAction={
                    <Tooltip title="Baixar Boleto (PDF)">
                      <span> {/* Span needed for disabled state */}
                        <IconButton
                            edge="end"
                            aria-label="download"
                            onClick={() => handleDownload(bill)}
                            disabled={downloading === bill.id}
                        >
                          {downloading === bill.id ? <CircularProgress size={20} /> : <DownloadIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  }
                >
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Boleto Referente a ${bill.reference_period || 'N/A'}`}
                    secondary={`Enviado em: ${dayjs(bill.uploaded_at).format('DD/MM/YYYY')}`}
                  />
                </ListItem>
              ))}
            </List>
         </Paper>
      )}
    </Box>
  );
};

export default ViewBills;