import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  CircularProgress,
  // Alert, // Removed Alert import
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  Chip,
  Tooltip,
  IconButton,
  TextField,
  Skeleton,
  // InfoIcon // Removed incorrect import from @mui/material
} from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info'; // Correct import
import dayjs, { Dayjs } from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';

dayjs.extend(isBetweenPlugin);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

// Interface for reservation data from DB
interface Reservation {
  id: number;
  reservation_date: string;
  user_id: string;
  start_time: string;
  end_time: string;
}

// Skeleton Row for My Reservations List
const MyReservationSkeletonRow: React.FC = () => (
    <ListItem
        secondaryAction={
            <Skeleton variant="circular" width={24} height={24} />
        }
        divider
    >
        <ListItemText
            primary={<Skeleton variant="text" width="60%" />}
        />
    </ListItem>
); // Correctly closed component definition

const RESOURCE_NAME = 'barbecue_area';
const MIN_RESERVATION_HOURS = 2;
const MAX_RESERVATION_HOURS = 4;
const AVAILABLE_START_HOUR = 9;
const AVAILABLE_END_HOUR = 22;

const TenantReserveBBQ: React.FC = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [dailyReservedSlots, setDailyReservedSlots] = useState<Set<string>>(new Set());
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // --- Fetching Logic ---
  const fetchReservations = async (targetDate?: Dayjs | null) => {
    setFetchLoading(true);
    try {
      const { data, error: fetchError } = await supabase.from('reservations').select('id, reservation_date, user_id, start_time, end_time').eq('resource_name', RESOURCE_NAME).order('reservation_date', { ascending: true }).order('start_time', { ascending: true });
      if (fetchError) throw fetchError;
      const fetchedReservations = data || [];
      setReservations(fetchedReservations);
      setMyReservations(fetchedReservations.filter(r => r.user_id === user?.id));
      updateDailySlots(targetDate || selectedDate, fetchedReservations);
    } catch (err: any) {
      console.error("Error fetching reservations:", err);
      enqueueSnackbar(`Erro ao carregar reservas: ${err.message}`, { variant: 'error' });
      setReservations([]); setMyReservations([]); setDailyReservedSlots(new Set());
    } finally {
      setFetchLoading(false);
    }
  };

  const updateDailySlots = (date: Dayjs | null, allReservations: Reservation[]) => {
      if (!date) { setDailyReservedSlots(new Set()); return; }
      const dateStr = date.format('YYYY-MM-DD');
      const slots = new Set( allReservations .filter(r => r.reservation_date === dateStr) .map(r => `${r.start_time.substring(0, 5)}-${r.end_time.substring(0, 5)}`) );
      setDailyReservedSlots(slots);
  };

  useEffect(() => { if (user) { fetchReservations(selectedDate); } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // --- Handlers ---
   const handleDateChange = (newValue: Dayjs | null) => { setSelectedDate(newValue); setStartTime(''); setEndTime(''); updateDailySlots(newValue, reservations); };
   const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type: 'start' | 'end') => { const value = event.target.value; if (type === 'start') { setStartTime(value); } else { setEndTime(value); } };

  // --- Validation Logic ---
   const validateTimes = (): string | null => { if (!startTime || !endTime) return "Selecione o horário de início e fim."; const start = dayjs(startTime, 'HH:mm'); const end = dayjs(endTime, 'HH:mm'); if (!start.isValid() || !end.isValid()) return "Formato de hora inválido (use HH:mm)."; if (end.isBefore(start) || end.isSame(start)) return "Horário final deve ser após o horário inicial."; const durationHours = dayjs.duration(end.diff(start)).asHours(); if (durationHours < MIN_RESERVATION_HOURS) return `Duração mínima da reserva é ${MIN_RESERVATION_HOURS} horas.`; if (durationHours > MAX_RESERVATION_HOURS) return `Duração máxima da reserva é ${MAX_RESERVATION_HOURS} horas.`; if (start.hour() < AVAILABLE_START_HOUR || end.hour() > AVAILABLE_END_HOUR || (end.hour() === AVAILABLE_END_HOUR && end.minute() > 0)) { return `Reservas permitidas apenas entre ${AVAILABLE_START_HOUR}:00 e ${AVAILABLE_END_HOUR}:00.`; } const newSlotStart = start.minute() + start.hour() * 60; const newSlotEnd = end.minute() + end.hour() * 60; for (const slot of dailyReservedSlots) { const [existingStartStr, existingEndStr] = slot.split('-'); const existingStart = dayjs(existingStartStr, 'HH:mm'); const existingEnd = dayjs(existingEndStr, 'HH:mm'); const existingSlotStart = existingStart.minute() + existingStart.hour() * 60; const existingSlotEnd = existingEnd.minute() + existingEnd.hour() * 60; if (newSlotStart < existingSlotEnd && newSlotEnd > existingSlotStart) { return `Conflito com reserva existente (${existingStartStr}-${existingEndStr}).`; } } return null; };

  // --- Reservation Actions ---
  const handleReserve = async () => { if (!selectedDate || !user) { enqueueSnackbar("Selecione uma data.", { variant: 'warning' }); return; } const validationError = validateTimes(); if (validationError) { enqueueSnackbar(validationError, { variant: 'warning' }); return; } const dateString = selectedDate.format('YYYY-MM-DD'); const startTimeString = dayjs(startTime, 'HH:mm').format('HH:mm:00'); const endTimeString = dayjs(endTime, 'HH:mm').format('HH:mm:00'); setLoading(true); try { const { error: insertError } = await supabase.from('reservations').insert({ user_id: user.id, resource_name: RESOURCE_NAME, reservation_date: dateString, start_time: startTimeString, end_time: endTimeString, }); if (insertError) throw insertError; enqueueSnackbar(`Churrasqueira reservada com sucesso para ${selectedDate.format('DD/MM/YYYY')} das ${startTime} às ${endTime}!`, { variant: 'success' }); fetchReservations(selectedDate); setStartTime(''); setEndTime(''); } catch (err: any) { console.error("Error creating reservation:", err); let message = `Erro ao reservar: ${err.message}`; if (err.code === '23505' || err.message.includes('overlapping')) { message = "Conflito: Este horário ou parte dele já está reservado."; } else if (err.message.includes('RLS')) { message = "Você não tem permissão para fazer esta reserva."; } enqueueSnackbar(message, { variant: 'error' }); fetchReservations(selectedDate); } finally { setLoading(false); } };
   const handleCancel = async (reservationId: number) => { if (!window.confirm("Tem certeza que deseja cancelar sua reserva?")) return; setLoading(true); try { const { error: deleteError } = await supabase.from('reservations').delete().eq('id', reservationId).eq('user_id', user?.id); if (deleteError) throw deleteError; enqueueSnackbar("Sua reserva foi cancelada com sucesso.", { variant: 'success' }); fetchReservations(selectedDate); } catch (err: any) { console.error("Error deleting reservation:", err); let message = `Erro ao cancelar reserva: ${err.message}`; if (err.message.includes('RLS')) { message = "Você não tem permissão para cancelar esta reserva."; } enqueueSnackbar(message, { variant: 'error' }); } finally { setLoading(false); } };

  // --- Custom Day Rendering ---
  const CustomPickersDay = (props: PickersDayProps<Dayjs>) => { const { day, outsideCurrentMonth, ...other } = props; const dateStr = day.format('YYYY-MM-DD'); const hasReservation = reservations.some(r => r.reservation_date === dateStr); const isPast = day.isBefore(dayjs(), 'day'); const isDisabled = other.disabled || isPast || outsideCurrentMonth; return ( <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} disabled={isDisabled} sx={{ ...(hasReservation && !isDisabled && { border: '1px solid', borderColor: 'warning.light', }), }} /> ); };

  // --- Render ---
  const validationResult = useMemo(() => validateTimes(), [startTime, endTime, dailyReservedSlots]);
  const canReserve = selectedDate && startTime && endTime && !validationResult;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Reservar Churrasqueira</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}> Selecione a data, o horário de início e fim ({MIN_RESERVATION_HOURS}-{MAX_RESERVATION_HOURS}h, entre {AVAILABLE_START_HOUR}:00-{AVAILABLE_END_HOUR}:00). Datas com borda indicam que já possuem alguma reserva. </Typography>

      {/* Removed Alert display */}

      <Paper sx={{ p: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Calendar */}
            <Box sx={{ flex: 1, minWidth: '280px' }}>
              <Typography variant="subtitle1" align="center" gutterBottom>Selecione a Data</Typography>
              <StaticDatePicker displayStaticWrapperAs="desktop" value={selectedDate} onChange={handleDateChange} minDate={dayjs()} slots={{ day: CustomPickersDay }} slotProps={{ actionBar: { actions: [] }, day: {} as any }} />
            </Box>

            {/* Time Selection & Booking */}
            <Box sx={{ flex: 1, minWidth: '280px' }}>
               <Typography variant="subtitle1" align="center" gutterBottom>Selecione o Horário</Typography>
               <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                   <TextField label="Início" type="time" value={startTime} onChange={(e) => handleTimeChange(e, 'start')} InputLabelProps={{ shrink: true }} inputProps={{ step: 1800 }} sx={{ flex: 1 }} disabled={!selectedDate || loading} />
                   <TextField label="Fim" type="time" value={endTime} onChange={(e) => handleTimeChange(e, 'end')} InputLabelProps={{ shrink: true }} inputProps={{ step: 1800 }} sx={{ flex: 1 }} disabled={!selectedDate || loading} />
               </Box>
               <Button variant="contained" color="primary" onClick={handleReserve} disabled={!canReserve || loading} fullWidth sx={{ mt: 2, py: 1.5 }} >
                 {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Reserva'}
               </Button>
               <Box sx={{ mt: 3 }}>
                   <Typography variant="body2" gutterBottom>Horários reservados para {selectedDate?.format('DD/MM/YYYY') || 'a data selecionada'}:</Typography>
                   {fetchLoading ? <CircularProgress size={20}/> : dailyReservedSlots.size === 0 ? <Typography variant="caption" color="text.secondary">Nenhum horário reservado.</Typography> : <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}> {[...dailyReservedSlots].sort().map(slot => <Chip key={slot} label={slot} size="small" />)} </Box> }
               </Box>
            </Box>
        </Box>

        {/* List of My Reservations */}
        <Box sx={{ mt: 3 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>Minhas Reservas</Typography>
            {fetchLoading ? ( <List dense> <MyReservationSkeletonRow /> <MyReservationSkeletonRow /> </List> )
             : myReservations.length === 0 ? ( <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, color: 'text.secondary' }}><InfoIcon sx={{ mr: 1 }} /><Typography variant="body2">Você não possui reservas.</Typography></Box> )
             : ( <List dense sx={{ maxHeight: '200px', overflowY: 'auto' }}> {myReservations.map((res, index, arr) => {
                  // Define secondary action separately
                  const cancelAction = (
                    <Tooltip title="Cancelar Reserva">
                       {/* IconButton is the single direct child */}
                       <IconButton edge="end" aria-label="cancel" onClick={() => handleCancel(res.id)} disabled={loading}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  );
                  return (
                    <React.Fragment key={res.id}>
                      <ListItem secondaryAction={cancelAction}>
                        <ListItemText primary={`${dayjs(res.reservation_date).format('DD/MM/YYYY')} das ${res.start_time.substring(0,5)} às ${res.end_time.substring(0,5)}`} />
                      </ListItem>
                      {index < arr.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  );
                })} </List> )}
          </Box>
      </Paper>
    </Box>
  );
};

export default TenantReserveBBQ;