import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useSnackbar } from 'notistack'; // Import useSnackbar
import {
  Box,
  Typography,
  CircularProgress,
  // Alert, // Removed Alert import
  // Alert, // No longer needed
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Divider,
  Tooltip,
  Skeleton,
  // InfoIcon // Removed incorrect import
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info'; // Correct import
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Interface remains the same...
interface ReservationWithDetails { id: number; reservation_date: string; user_id: string; full_name: string | null; block_number: string | null; apartment_number: string | null; start_time: string; end_time: string; }

// SkeletonRow remains the same...
const SkeletonRow: React.FC = () => ( <ListItem secondaryAction={ <Skeleton variant="circular" width={24} height={24} /> } divider > <ListItemText primary={<Skeleton variant="text" width="60%" />} secondary={<Skeleton variant="text" width="80%" />} /> </ListItem> );

const RESOURCE_NAME = 'barbecue_area';

const ReserveBBQ: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar(); // Get snackbar function
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [loading, setLoading] = useState(false); // For delete action
  const [fetchLoading, setFetchLoading] = useState(true);
  // Removed error and success state

  // fetchReservations remains the same, but use snackbar for errors
  const fetchReservations = async () => {
    setFetchLoading(true);
    // setError(null); // Removed
    try {
      const { data, error: rpcError } = await supabase.rpc('get_bbq_reservations_with_details');
      if (rpcError) throw rpcError;
      setReservations(data || []);
    } catch (err: any) {
      console.error("Error fetching reservations via RPC:", err);
      enqueueSnackbar(`Erro ao carregar reservas: ${err.message}`, { variant: 'error' }); // Snackbar for fetch error
      setReservations([]); // Clear on error
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

   // handleDelete remains the same, but use snackbar for feedback
   const handleDelete = async (reservationId: number) => {
     if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;
     setLoading(true);
     // setError(null); // Removed
     // setSuccess(null); // Removed
     try {
       const { error: deleteError } = await supabase.from('reservations').delete().eq('id', reservationId).eq('resource_name', RESOURCE_NAME); // Add resource filter
       if (deleteError) throw deleteError;
       enqueueSnackbar("Reserva cancelada com sucesso.", { variant: 'success' }); // Success snackbar
       fetchReservations(); // Refresh list
     } catch (err: any) {
       console.error("Error deleting reservation:", err);
       enqueueSnackbar(`Erro ao cancelar reserva: ${err.message}`, { variant: 'error' }); // Error snackbar
     } finally {
       setLoading(false);
     }
   };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Consultar Reservas da Churrasqueira</Typography>
      {/* Removed Alert components */}

      <Paper sx={{ p: { xs: 1, sm: 2 } }}>
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
           {fetchLoading ? ( <List dense> <SkeletonRow /> <SkeletonRow /> <SkeletonRow /> </List> )
            : reservations.length === 0 ? ( <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, color: 'text.secondary' }}><InfoIcon sx={{ mr: 1 }} /><Typography variant="body2">Nenhuma reserva encontrada.</Typography></Box> )
            : ( <List dense> {reservations.map((res, index) => {
                 // Define secondary action separately
                 const cancelAction = (
                    <Tooltip title="Cancelar Reserva">
                         <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(res.id)} disabled={loading}>
                           {loading && reservations.find(r => r.id === res.id) ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon fontSize="small" />}
                         </IconButton>
                    </Tooltip>
                 );
                 return (
                    <React.Fragment key={res.id}>
                        <ListItem secondaryAction={cancelAction} >
                            <ListItemText primary={`${dayjs(res.reservation_date).format('DD/MM/YYYY')} (${res.start_time?.substring(0,5) || '?'} - ${res.end_time?.substring(0,5) || '?'})`} secondary={`Reservado por: ${res.full_name || 'Usuário Desconhecido'} (${res.block_number || '?'}/${res.apartment_number || '?'})`} />
                        </ListItem>
                        {index < reservations.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                 );
                })} </List> )}
         </Box>
      </Paper>
    </Box>
  );
};

export default ReserveBBQ;