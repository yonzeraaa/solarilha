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
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Interface matching the structure returned by the RPC function
interface ReservationWithDetails {
  id: number;
  reservation_date: string;
  user_id: string;
  full_name: string | null;
  block_number: string | null;
  apartment_number: string | null;
}

// No longer needed as RPC returns combined data
// interface ReservationWithUser { ... }

const RESOURCE_NAME = 'barbecue_area'; // Still needed for delete logic if kept

const ReserveBBQ: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]); // Use new interface
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Function to fetch reservations using the RPC function
  const fetchReservations = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      console.log("Calling RPC function get_bbq_reservations_with_details...");
      // Call the SQL function directly
      const { data, error: rpcError } = await supabase.rpc(
        'get_bbq_reservations_with_details'
        // Pass arguments here if the function required them, e.g., { arg_name: value }
      );

      if (rpcError) throw rpcError;

      console.log("Fetched reservation data via RPC:", data);
      setReservations(data || []); // Set state with data returned from function

    } catch (err: any) {
      console.error("Error fetching reservations via RPC:", err);
      setError(`Erro ao carregar reservas: ${err.message}`);
      setReservations([]);
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch reservations on mount
  useEffect(() => {
    fetchReservations();
  }, []);

   // Handle deleting a reservation (still uses direct table access, which is fine for admins)
   const handleDelete = async (reservationId: number) => {
     if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;
     setLoading(true);
     setError(null);
     setSuccess(null);
     try {
       const { error: deleteError } = await supabase
         .from('reservations')
         .delete()
         .eq('id', reservationId);

       if (deleteError) throw deleteError;

       setSuccess("Reserva cancelada com sucesso.");
       fetchReservations(); // Refresh list

     } catch (err: any) {
       console.error("Error deleting reservation:", err);
       setError(`Erro ao cancelar reserva: ${err.message}`);
     } finally {
       setLoading(false);
     }
   };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Consultar Reservas da Churrasqueira</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 1, sm: 2 } }}>
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
           {fetchLoading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>
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
                           <DeleteIcon fontSize="small" />
                         </IconButton>
                       </Tooltip>
                     }
                   >
                     <ListItemText
                       primary={`${dayjs(res.reservation_date).format('DD/MM/YYYY')}`}
                       // Display data directly from the RPC result object
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