import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
// import { useAuth } from '../../contexts/AuthContext'; // No longer needed for creating reservations
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
  Divider // Added for visual separation
} from '@mui/material';
// Removed Date Picker imports
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Define interface for reservation data (including user info)
interface ReservationWithUser {
  id: number;
  reservation_date: string; // Comes as string from Supabase
  user_id: string;
  profiles: { // Should be an object for one-to-one relation
    full_name: string | null;
    block_number: string | null;
  } | null; // Profile might be null if user deleted or FK constraint allows null?
}

const RESOURCE_NAME = 'barbecue_area';

const ReserveBBQ: React.FC = () => {
  // const { user } = useAuth(); // Not needed for creating
  // Removed selectedDate state
  const [reservations, setReservations] = useState<ReservationWithUser[]>([]);
  // Removed reservedDates state
  const [loading, setLoading] = useState(false); // Used for delete operation
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Function to fetch reservations including user profile info
  const fetchReservations = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      // Fetch reservations and join with profiles table to get user name/block
      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select(`
          id,
          reservation_date,
          user_id,
          profiles ( full_name, block_number )
        `) // Fetch related profile data
        .eq('resource_name', RESOURCE_NAME)
        .order('reservation_date', { ascending: true });

      if (fetchError) throw fetchError;

      setReservations(data || []);

    } catch (err: any) {
      console.error("Error fetching reservations:", err);
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

  // Removed handleDateChange
  // Removed handleReserve

   // Handle deleting a reservation
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

  // Removed renderDay function

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Consultar Reservas da Churrasqueira</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 1, sm: 2 } }}>
        {/* List of Reservations */}
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}> {/* Limit height and make scrollable */}
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
                       <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(res.id)} disabled={loading}>
                         <DeleteIcon fontSize="small" />
                       </IconButton>
                     }
                   >
                     <ListItemText
                       primary={`${dayjs(res.reservation_date).format('DD/MM/YYYY')}`}
                       secondary={`Reservado por: ${res.profiles?.full_name || 'Usuário Desconhecido'} (${res.profiles?.block_number || 'Bloco?'})`}
                     />
                   </ListItem>
                   {index < reservations.length - 1 && <Divider component="li" />} {/* Add divider between items */}
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