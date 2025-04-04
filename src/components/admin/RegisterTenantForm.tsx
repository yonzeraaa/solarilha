import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent
} from '@mui/material';

// Generate block numbers from 1A to 8B
const blockNumbers: string[] = [];
for (let i = 1; i <= 8; i++) {
  blockNumbers.push(`${i}A`);
  blockNumbers.push(`${i}B`);
}

const RegisterTenantForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [blockNumber, setBlockNumber] = useState<string>('');
  const [apartmentNumber, setApartmentNumber] = useState(''); // State for Apartment Number
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBlockChange = (event: SelectChangeEvent<string>) => {
    setBlockNumber(event.target.value as string);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Add apartmentNumber to validation
    if (!fullName || !email || !password || !blockNumber || !apartmentNumber) {
      setError('Todos os campos são obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      // Include apartmentNumber in the body
      const { data, error: functionError } = await supabase.functions.invoke('create-tenant', {
        body: { fullName, email, password, blockNumber, apartmentNumber },
      });

      if (functionError) {
        let message = functionError.message;
        try {
            const context = JSON.parse(functionError.context || '{}');
            if (context.error) message = context.error;
        } catch(e) { /* Ignore parsing error */ }

        console.error('Error invoking create-tenant function:', functionError);
        setError(`Erro ao criar inquilino: ${message}`);
        setLoading(false);
        return;
      }

      console.log('Tenant creation response:', data);
      setSuccess(`Inquilino ${fullName} (${email}, Bloco ${blockNumber}/${apartmentNumber}) criado com sucesso!`);
      // Clear form on success
      setFullName('');
      setEmail('');
      setPassword('');
      setBlockNumber('');
      setApartmentNumber(''); // Clear apartment number field

    } catch (catchError: any) {
      console.error('Unexpected error calling function:', catchError);
      setError(`Ocorreu um erro inesperado: ${catchError.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, maxWidth: '600px', mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Cadastrar Novo Inquilino
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ mb: 2 }}>
        <TextField
          required
          fullWidth
          id="fullName"
          label="Nome Completo"
          name="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={loading}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          required
          fullWidth
          id="email"
          label="Endereço de Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          sx={{ flex: 1 }}
        />
        <TextField
          required
          fullWidth
          name="password"
          label="Senha Inicial"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          helperText="O inquilino deverá alterar esta senha."
          sx={{ flex: 1 }}
        />
      </Box>

      {/* Box for Block and Apartment Number */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
         <FormControl fullWidth required disabled={loading} sx={{ flex: 1 }}> {/* Make FormControl take half width */}
           <InputLabel id="block-number-label">Bloco</InputLabel>
           <Select
             labelId="block-number-label"
             id="blockNumber"
             value={blockNumber}
             label="Bloco" // Simplified label
             onChange={handleBlockChange}
           >
             <MenuItem value="" disabled>
               <em>Selecione</em>
             </MenuItem>
             {blockNumbers.map((block) => (
               <MenuItem key={block} value={block}>{block}</MenuItem>
             ))}
           </Select>
         </FormControl>
         <TextField
            required
            fullWidth
            id="apartmentNumber"
            label="Nº Apto" // Simplified label
            name="apartmentNumber"
            value={apartmentNumber}
            onChange={(e) => setApartmentNumber(e.target.value)}
            disabled={loading}
            sx={{ flex: 1 }} // Make TextField take half width
          />
      </Box>

      <Box sx={{ position: 'relative', mt: 3 }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          // Update disabled check
          disabled={loading || !fullName || !email || !password || !blockNumber || !apartmentNumber}
          sx={{ py: 1.2 }}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Inquilino'}
        </Button>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              color: 'primary.contrastText',
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default RegisterTenantForm;