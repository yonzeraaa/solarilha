import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useSnackbar } from 'notistack'; // Import useSnackbar
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  // Alert, // No longer needed
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent
} from '@mui/material';

// Generate block numbers (remains the same)
const blockNumbers: string[] = [];
for (let i = 1; i <= 8; i++) { blockNumbers.push(`${i}A`); blockNumbers.push(`${i}B`); }

const RegisterTenantForm: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar(); // Get snackbar function
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [blockNumber, setBlockNumber] = useState<string>('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  // Removed error and success state

  const handleBlockChange = (event: SelectChangeEvent<string>) => {
    setBlockNumber(event.target.value as string);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    // Removed setError/setSuccess

    if (!fullName || !email || !password || !blockNumber || !apartmentNumber) {
      enqueueSnackbar('Todos os campos são obrigatórios.', { variant: 'warning' }); // Use snackbar
      setLoading(false);
      return;
    }

    try {
      const { data, error: functionError } = await supabase.functions.invoke('create-tenant', {
        body: { fullName, email, password, blockNumber, apartmentNumber },
      });

      if (functionError) {
        let message = functionError.message;
        try { const context = JSON.parse(functionError.context || '{}'); if (context.error) message = context.error; } catch(e) {}
        throw new Error(message); // Throw error to be caught below
      }

      console.log('Tenant creation response:', data);
      enqueueSnackbar(`Inquilino ${fullName} (${email}) criado com sucesso!`, { variant: 'success' }); // Success snackbar
      // Clear form on success
      setFullName(''); setEmail(''); setPassword(''); setBlockNumber(''); setApartmentNumber('');

    } catch (err: any) {
      console.error('Error creating tenant:', err);
      enqueueSnackbar(`Erro ao criar inquilino: ${err.message}`, { variant: 'error' }); // Error snackbar
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, maxWidth: '600px', mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Cadastrar Novo Inquilino
      </Typography>

      {/* Removed Alert components */}

      {/* TextFields and Select remain the same */}
       <TextField required fullWidth id="fullName" label="Nome Completo" name="fullName" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} />
       <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
         <TextField required fullWidth id="email" label="Endereço de Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} sx={{ flex: 1 }} />
         <TextField required fullWidth name="password" label="Senha Inicial" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} helperText="O inquilino deverá alterar esta senha." sx={{ flex: 1 }} />
       </Box>
       <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <FormControl fullWidth required disabled={loading} sx={{ flex: 1 }} margin="normal">
            <InputLabel id="block-number-label">Bloco</InputLabel>
            <Select labelId="block-number-label" id="blockNumber" value={blockNumber} label="Bloco" onChange={handleBlockChange} >
              <MenuItem value="" disabled><em>Selecione</em></MenuItem>
              {blockNumbers.map((block) => ( <MenuItem key={block} value={block}>{block}</MenuItem> ))}
            </Select>
          </FormControl>
          <TextField required fullWidth id="apartmentNumber" label="Nº Apto" name="apartmentNumber" value={apartmentNumber} onChange={(e) => setApartmentNumber(e.target.value)} disabled={loading} sx={{ flex: 1 }} margin="normal" />
       </Box>


      <Box sx={{ position: 'relative', mt: 3 }}>
        <Button type="submit" fullWidth variant="contained" color="primary" disabled={loading || !fullName || !email || !password || !blockNumber || !apartmentNumber} sx={{ py: 1.2 }} >
          {loading ? 'Cadastrando...' : 'Cadastrar Inquilino'}
        </Button>
        {loading && ( <CircularProgress size={24} sx={{ color: 'primary.contrastText', position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px', }} /> )}
      </Box>
    </Box>
  );
};

export default RegisterTenantForm;