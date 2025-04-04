import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
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
  Paper,
  InfoIcon, // Use Filled version
  Skeleton // Import Skeleton
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';

// Interface remains the same...
interface Bill {
  id: number;
  file_path: string;
  reference_period: string | null;
  uploaded_at: string;
}

// Skeleton Row for Bills List
const SkeletonRow: React.FC = () => (
    <ListItem
        secondaryAction={
            <Skeleton variant="circular" width={24} height={24} />
        }
    >
        <ListItemIcon>
            <Skeleton variant="circular" width={24} height={24} />
        </ListItemIcon>
        <ListItemText
            primary={<Skeleton variant="text" width="50%" />}
            secondary={<Skeleton variant="text" width="30%" />}
        />
    </ListItem>
);


const ViewBills: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true); // Keep this loading state
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      if (!user) return;
      // setLoading(true); // Already true initially
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('bills')
          .select('id, file_path, reference_period, uploaded_at')
          .eq('tenant_id', user.id)
          .order('reference_period', { ascending: false });

        if (fetchError) throw fetchError;
        setBills(data || []);
      } catch (err: any) {
        console.error("Error fetching bills:", err);
        setError(`Erro ao carregar boletos: ${err.message}`);
      } finally {
        setLoading(false); // Set loading false after fetch attempt
      }
    };
    fetchBills();
  }, [user]);

  // handleDownload remains the same...
  const handleDownload = async (bill: Bill) => {
    setDownloading(bill.id); setError(null);
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
    finally { setDownloading(null); }
  };

  // Removed initial loading check here

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Meus Boletos</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
          // Show Skeleton list while loading
          <Paper sx={{ mt: 2 }}>
              <List>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
              </List>
          </Paper>
      ) : bills.length === 0 ? (
          // Show message if no bills and not loading
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, color: 'text.secondary', mt: 2 }}>
              <InfoIcon sx={{ mr: 1 }} />
              <Typography variant="body2">Nenhum boleto disponível no momento.</Typography>
          </Box>
      ) : (
          // Render actual bill list
         <Paper sx={{ mt: 2 }}>
            <List>
              {bills.map((bill) => (
                <ListItem
                  key={bill.id}
                  secondaryAction={
                    <Tooltip title="Baixar Boleto (PDF)">
                      <span>
                        <IconButton edge="end" aria-label="download" onClick={() => handleDownload(bill)} disabled={downloading === bill.id} >
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