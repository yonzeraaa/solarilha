import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Divider,
  Tooltip,
  Skeleton // Import Skeleton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Interface remains the same...
interface ReservationWithDetails {
  id: number;
  reservation_date: string;
  user_id: string;
  full_name: string | null;
  block_number: string | null;
  apartment_number: string | null;
  start_time: string;
  end_time: string;
}

// Skeleton Row for Reservations
const SkeletonRow: React.FC = () => (
    <ListItem
        secondaryAction={
            <Skeleton variant="circular" width={24} height={24} />
        }
        divider
    >
        <ListItemText
            primary={<Skeleton variant="text" width="60%" />}
            secondary={<Skeleton variant="text" width="80%" />}
        />
    </ListItem>
);


const RESOURCE_NAME = 'barbecue_area';

const ReserveBBQ: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [loading, setLoading] = useState(false); // For delete action
  const [fetchLoading, setFetchLoading] = useState(true); // Keep this loading state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // fetchReservations remains the same...
  const fetchReservations = async () => {
    // setFetchLoading(true); // Already true initially
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_bbq_reservations_with_details');
      if (rpcError) throw rpcError;
      setReservations(data || []);
    } catch (err: any) {
      console.error("Error fetching reservations via RPC:", err);
      setError(`Erro ao carregar reservas: ${err.message}`);
    } finally {
      setFetchLoading(false); // Set loading false after fetch attempt
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // handleDelete remains the same...
   const handleDelete = async (reservationId: number) => {
     if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;
     setLoading(true); setError(null); setSuccess(null);
     try {
       const { error: deleteError } = await supabase.from('reservations').delete().eq('id', reservationId);
       if (deleteError) throw deleteError;
       setSuccess("Reserva cancelada com sucesso."); fetchReservations();
     } catch (err: any) { setError(`Erro ao cancelar reserva: ${err.message}`); }
     finally { setLoading(false); }
   };

  // Removed initial loading check here

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Consultar Reservas da Churrasqueira</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 1, sm: 2 } }}>
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
           {fetchLoading ? (
             // Show Skeleton list items while loading
             <List dense>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
             </List>
           ) : reservations.length === 0 ? (
             <Typography align="center" color="text.secondary" sx={{ p: 2 }}>Nenhuma reserva encontrada.</Typography>
           ) : (
             <List dense>
               {reservations.map((res, index) => (
                 <React.Fragment key={res.id}>
                   <ListItem
                     secondaryAction={
                       <Tooltip title="Cancelar Reserva">
                         <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(res.id)} disabled={loading}>
                           {loading && reservations.find(r => r.id === res.id) ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="small" />} {/* Show spinner on specific item being deleted */}
                         </IconButton>
                       </Tooltip>
                     }
                   >
                     <ListItemText
                       primary={`${dayjs(res.reservation_date).format('DD/MM/YYYY')} (${res.start_time?.substring(0,5) || '?'} - ${res.end_time?.substring(0,5) || '?'})`}
                       secondary={`Reservado por: ${res.full_name || 'Usuário Desconhecido'} (${res.block_number || '?'}/${res.apartment_number || '?'})`}
                     />
                   </ListItem>
                   {index < reservations.length - 1 && <Divider component="li" />}
                 </React.Fragment>
               ))}
             </List>
           )}
         </Box>
      </Paper>
    </Box>
  );
};

export default ReserveBBQ;