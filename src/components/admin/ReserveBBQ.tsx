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
  IconButton,
  Paper
} from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs, { Dayjs } from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc'; // Import UTC plugin
import timezone from 'dayjs/plugin/timezone'; // Import timezone plugin

dayjs.extend(isBetweenPlugin);
dayjs.extend(utc);
dayjs.extend(timezone);

// Define interface for reservation data
interface Reservation {
  id: number;
  reservation_date: string; // Comes as string from Supabase
  user_id: string; // We might want to fetch user name later
}

const RESOURCE_NAME = 'barbecue_area'; // Define the resource name

const ReserveBBQ: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs()); // Default to today
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservedDates, setReservedDates] = useState<Set<string>>(new Set()); // Set of YYYY-MM-DD strings
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Function to fetch reservations
  const fetchReservations = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select('id, reservation_date, user_id')
        .eq('resource_name', RESOURCE_NAME)
        // Optionally filter by month/year for performance
        // .gte('reservation_date', startDate)
        // .lte('reservation_date', endDate)
        .order('reservation_date', { ascending: true });

      if (fetchError) throw fetchError;

      setReservations(data || []);
      // Store reserved dates in YYYY-MM-DD format for quick lookup
      const dates = new Set(data?.map(r => dayjs(r.reservation_date).format('YYYY-MM-DD')) || []);
      setReservedDates(dates);

    } catch (err: any) {
      console.error("Error fetching reservations:", err);
      setError(`Erro ao carregar reservas: ${err.message}`);
      setReservations([]);
      setReservedDates(new Set());
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch reservations on mount
  useEffect(() => {
    fetchReservations();
  }, []);

  // Handle date selection from calendar
  const handleDateChange = (newValue: Dayjs | null) => {
    setSelectedDate(newValue);
    setError(null); // Clear errors on new date selection
    setSuccess(null);
  };

  // Handle making a reservation
  const handleReserve = async () => {
    if (!selectedDate || !user) {
      setError("Selecione uma data e certifique-se de estar logado.");
      return;
    }

    const dateString = selectedDate.format('YYYY-MM-DD');

    // Check if already reserved
    if (reservedDates.has(dateString)) {
      setError("Esta data já está reservada.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: insertError } = await supabase
        .from('reservations')
        .insert({
          user_id: user.id,
          resource_name: RESOURCE_NAME,
          reservation_date: dateString,
        });

      if (insertError) throw insertError;

      setSuccess(`Churrasqueira reservada com sucesso para ${selectedDate.format('DD/MM/YYYY')}!`);
      // Refresh reservations list
      fetchReservations();
      setSelectedDate(null); // Clear selection after booking

    } catch (err: any) {
      console.error("Error creating reservation:", err);
      // Handle unique constraint violation specifically
      if (err.code === '23505') { // PostgreSQL unique violation code
         setError("Esta data já foi reservada por outra pessoa.");
      } else {
         setError(`Erro ao reservar: ${err.message}`);
      }
      // Optionally refresh list even on error to get latest state
      fetchReservations();
    } finally {
      setLoading(false);
    }
  };

   // Handle deleting a reservation
   const handleDelete = async (reservationId: number) => {
     if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;

     setLoading(true); // Use general loading state or a specific delete loading state
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

  // Custom Day component using slots API
  const CustomPickersDay = (props: PickersDayProps<Dayjs>) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const dateString = day.format('YYYY-MM-DD');
    const isReserved = reservedDates.has(dateString);
    const isPast = day.isBefore(dayjs(), 'day');

    // Combine disabled states
    const isDisabled = other.disabled || isReserved || isPast || outsideCurrentMonth;

    return (
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        disabled={isDisabled}
        sx={{
          ...(isReserved && !isDisabled && { // Style reserved days only if not otherwise disabled
            backgroundColor: 'error.light',
            color: 'error.contrastText',
            '&:hover': {
              backgroundColor: 'error.main',
            },
            '&.Mui-selected': {
                 backgroundColor: 'error.main',
                 color: 'error.contrastText',
                 '&:hover': { // Ensure hover on selected reserved day is consistent
                    backgroundColor: 'error.dark',
                 }
            }
          }),
        }}
      />
    );
  };


  return (
    <Box>
      <Typography variant="h5" gutterBottom>Reservar Churrasqueira</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Calendar */}
        <Box sx={{ flex: 1, minWidth: '280px' }}>
          <Typography variant="subtitle1" align="center" gutterBottom>Selecione uma Data</Typography>
          <StaticDatePicker
            displayStaticWrapperAs="desktop" // Adjust layout
            value={selectedDate}
            onChange={handleDateChange}
            // renderDay={renderDay} // Use slots instead
            minDate={dayjs()}
            slots={{ day: CustomPickersDay }} // Pass the custom component to the 'day' slot
            slotProps={{
              day: {
                 // You can pass additional props to CustomPickersDay here if needed
                 // reservedDates: reservedDates, // Example, though CustomPickersDay accesses state directly now
              } as any, // Use 'as any' to bypass potential strict typing issues with slotProps if necessary
                actionBar: { actions: [] }, // Hide action bar (OK/Cancel)
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

        {/* List of Reservations */}
        <Box sx={{ flex: 1, minWidth: '280px', maxHeight: '500px', overflowY: 'auto' }}>
           <Typography variant="subtitle1" align="center" gutterBottom>Datas Reservadas</Typography>
           {fetchLoading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>
           ) : reservations.length === 0 ? (
             <Typography align="center" color="text.secondary" sx={{ p: 2 }}>Nenhuma reserva encontrada.</Typography>
           ) : (
             <List dense>
               {reservations.map((res) => (
                 <ListItem
                   key={res.id}
                   secondaryAction={
                     <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(res.id)} disabled={loading}>
                       <DeleteIcon fontSize="small" />
                     </IconButton>
                   }
                 >
                   <ListItemText
                     primary={dayjs(res.reservation_date).format('DD/MM/YYYY')}
                     // secondary={`Reservado por: ${res.user_id}`} // Add user info if needed
                   />
                 </ListItem>
               ))}
             </List>
           )}
         </Box>
      </Paper>
    </Box>
  );
};

export default ReserveBBQ;