import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip, // Add Tooltip
  IconButton, // Add IconButton
  Divider,
  Chip // To highlight user's own reservations
} from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import DeleteIcon from '@mui/icons-material/Delete'; // Add DeleteIcon
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import dayjs, { Dayjs } from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(isBetweenPlugin);
dayjs.extend(utc);
dayjs.extend(timezone);

// Interface for reservation data
interface Reservation {
  id: number;
  reservation_date: string; // Comes as string from Supabase
  user_id: string;
}

const RESOURCE_NAME = 'barbecue_area';

const TenantReserveBBQ: React.FC = () => {
  const { user } = useAuth(); // Get current tenant user
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservedDates, setReservedDates] = useState<Set<string>>(new Set());
  const [myReservedDates, setMyReservedDates] = useState<Set<string>>(new Set()); // Dates reserved by current user
  const [loading, setLoading] = useState(false); // For booking/cancelling
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Function to fetch reservations
  const fetchReservations = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      // RLS policy allows authenticated users to read all reservations
      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select('id, reservation_date, user_id')
        .eq('resource_name', RESOURCE_NAME)
        .order('reservation_date', { ascending: true });

      if (fetchError) throw fetchError;

      const fetchedReservations = data || [];
      setReservations(fetchedReservations);

      // Store all reserved dates and dates reserved by the current user
      const allDates = new Set<string>();
      const myDates = new Set<string>();
      fetchedReservations.forEach(r => {
          const dateStr = dayjs(r.reservation_date).format('YYYY-MM-DD');
          allDates.add(dateStr);
          if (r.user_id === user?.id) {
              myDates.add(dateStr);
          }
      });
      setReservedDates(allDates);
      setMyReservedDates(myDates);

    } catch (err: any) {
      console.error("Error fetching reservations:", err);
      setError(`Erro ao carregar reservas: ${err.message}`);
      setReservations([]);
      setReservedDates(new Set());
      setMyReservedDates(new Set());
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch reservations on mount
  useEffect(() => {
    if (user) { // Only fetch if user is available
        fetchReservations();
    }
  }, [user]);

  const handleDateChange = (newValue: Dayjs | null) => {
    setSelectedDate(newValue);
    setError(null);
    setSuccess(null);
  };

  // Handle making a reservation
  const handleReserve = async () => {
    if (!selectedDate || !user) {
      setError("Selecione uma data.");
      return;
    }

    const dateString = selectedDate.format('YYYY-MM-DD');

    if (reservedDates.has(dateString)) {
      setError("Esta data já está reservada.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Tenant needs INSERT RLS policy on reservations table
      const { error: insertError } = await supabase
        .from('reservations')
        .insert({
          user_id: user.id, // Use current tenant's ID
          resource_name: RESOURCE_NAME,
          reservation_date: dateString,
        });

      if (insertError) throw insertError;

      setSuccess(`Churrasqueira reservada com sucesso para ${selectedDate.format('DD/MM/YYYY')}!`);
      fetchReservations(); // Refresh list
      setSelectedDate(null);

    } catch (err: any) {
      console.error("Error creating reservation:", err);
      if (err.code === '23505') {
         setError("Esta data já foi reservada.");
      } else if (err.message.includes('check constraint') || err.message.includes('RLS')) {
          setError("Você não tem permissão para fazer esta reserva ou a data é inválida.");
      }
      else {
         setError(`Erro ao reservar: ${err.message}`);
      }
      fetchReservations(); // Refresh list even on error
    } finally {
      setLoading(false);
    }
  };

   // Handle cancelling OWN reservation
   const handleCancel = async (reservationId: number) => {
     if (!window.confirm("Tem certeza que deseja cancelar sua reserva?")) return;

     setLoading(true);
     setError(null);
     setSuccess(null);

     try {
       // Tenant needs DELETE RLS policy on reservations table (restricted to own user_id)
       const { error: deleteError } = await supabase
         .from('reservations')
         .delete()
         .eq('id', reservationId)
         .eq('user_id', user?.id); // Ensure they can only delete their own

       if (deleteError) throw deleteError;

       setSuccess("Sua reserva foi cancelada com sucesso.");
       fetchReservations(); // Refresh list

     } catch (err: any) {
       console.error("Error deleting reservation:", err);
        if (err.message.includes('RLS')) {
            setError("Você não tem permissão para cancelar esta reserva.");
        } else {
            setError(`Erro ao cancelar reserva: ${err.message}`);
        }
     } finally {
       setLoading(false);
     }
   };

  // Custom Day component using slots API
  const CustomPickersDay = (props: PickersDayProps<Dayjs>) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const dateString = day.format('YYYY-MM-DD');
    const isReservedByMe = myReservedDates.has(dateString);
    const isReservedByOther = reservedDates.has(dateString) && !isReservedByMe;
    const isPast = day.isBefore(dayjs(), 'day');

    const isDisabled = other.disabled || isReservedByOther || isPast || outsideCurrentMonth;

    return (
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        disabled={isDisabled}
        sx={{
          ...(isReservedByMe && !isDisabled && { // Highlight user's own reservations
            border: '2px solid',
            borderColor: 'primary.main', // Use theme's primary color
            backgroundColor: 'action.hover', // Slight background tint
          }),
          ...(isReservedByOther && !isDisabled && { // Style dates reserved by others differently
            backgroundColor: 'action.disabledBackground',
            color: 'action.disabled',
            '&:hover': {
              backgroundColor: 'action.disabledBackground', // Prevent hover effect
            },
          }),
        }}
      />
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Reservar Churrasqueira</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Selecione uma data disponível no calendário para fazer sua reserva. Datas em cinza já estão reservadas por outros. Datas com borda colorida são suas reservas.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Calendar */}
        <Box sx={{ flex: 1, minWidth: '280px' }}>
          <Typography variant="subtitle1" align="center" gutterBottom>Selecione uma Data</Typography>
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            value={selectedDate}
            onChange={handleDateChange}
            minDate={dayjs()}
            slots={{ day: CustomPickersDay }}
            slotProps={{
                actionBar: { actions: [] },
                day: {} as any,
            }}
          />
          <Button
             variant="contained"
             color="primary"
             onClick={handleReserve}
             disabled={!selectedDate || loading || reservedDates.has(selectedDate?.format('YYYY-MM-DD') || '')}
             fullWidth
             sx={{ mt: 2 }}
           >
             {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Reserva'}
           </Button>
        </Box>

        {/* List of My Reservations */}
        <Box sx={{ flex: 1, minWidth: '280px', maxHeight: '500px', overflowY: 'auto' }}>
           <Typography variant="subtitle1" align="center" gutterBottom>Minhas Reservas</Typography>
           {fetchLoading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>
           ) : reservations.filter(r => r.user_id === user?.id).length === 0 ? (
             <Typography align="center" color="text.secondary" sx={{ p: 2 }}>Você não possui reservas.</Typography>
           ) : (
             <List dense>
               {reservations
                 .filter(r => r.user_id === user?.id) // Filter only user's reservations
                 .map((res, index, arr) => (
                 <React.Fragment key={res.id}>
                   <ListItem
                     secondaryAction={
                       <Tooltip title="Cancelar Reserva">
                         <IconButton edge="end" aria-label="cancel" onClick={() => handleCancel(res.id)} disabled={loading}>
                           <DeleteIcon fontSize="small" />
                         </IconButton>
                       </Tooltip>
                     }
                   >
                     <ListItemText
                       primary={dayjs(res.reservation_date).format('DD/MM/YYYY')}
                     />
                   </ListItem>
                   {index < arr.length - 1 && <Divider component="li" />}
                 </React.Fragment>
               ))}
             </List>
           )}
         </Box>
      </Paper>
    </Box>
  );
};

export default TenantReserveBBQ;