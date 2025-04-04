import React, { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
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
  SelectChangeEvent,
  Input,
  Skeleton // Keep Skeleton
} from '@mui/material';

// Interface remains the same...
interface TenantProfile { id: string; full_name: string; block_number: string; apartment_number: string | null; }

const UploadBillForm: React.FC = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar(); // Get snackbar function
  const [tenants, setTenants] = useState<TenantProfile[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [referencePeriod, setReferencePeriod] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false); // For submission
  const [fetchLoading, setFetchLoading] = useState(true);
  // Removed error and success state

  // Fetch tenants (remains the same, but handle error with snackbar)
  useEffect(() => {
    const fetchTenants = async () => {
      setFetchLoading(true);
      // setError(null); // Removed
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, full_name, block_number, apartment_number') // Added apartment_number
          .eq('role', 'tenant')
          .order('full_name', { ascending: true });

        if (fetchError) throw fetchError;
        setTenants(data as TenantProfile[]);
      } catch (err: any) {
        console.error("Error fetching tenants:", err);
        enqueueSnackbar(`Erro ao carregar inquilinos: ${err.message}`, { variant: 'error' }); // Snackbar for fetch error
      } finally {
        setFetchLoading(false);
      }
    };
    fetchTenants();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Keep dependency array empty if fetch should only run once

  const handleTenantChange = (event: SelectChangeEvent<string>) => {
    setSelectedTenantId(event.target.value as string);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        // setError(null); // Removed
      } else {
        setSelectedFile(null);
        enqueueSnackbar('Por favor, selecione um arquivo PDF.', { variant: 'warning' }); // Snackbar for file type error
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTenantId || !referencePeriod || !selectedFile || !user) {
      enqueueSnackbar('Por favor, preencha todos os campos e selecione um arquivo PDF.', { variant: 'warning' }); // Snackbar validation
      return;
    }

    setLoading(true);
    // setError(null); // Removed
    // setSuccess(null); // Removed

    try {
      const fileExtension = selectedFile.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${referencePeriod}.${fileExtension}`;
      const filePath = `${selectedTenantId}/${uniqueFileName}`;

      console.log(`Uploading file to: ${filePath}`);
      const { error: uploadError } = await supabase.storage
        .from('tenant-bills')
        .upload(filePath, selectedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) { throw new Error(`Erro no upload do arquivo: ${uploadError.message}`); }
      console.log('File uploaded successfully.');

      const { error: insertError } = await supabase
        .from('bills')
        .insert({ tenant_id: selectedTenantId, file_path: filePath, reference_period: referencePeriod, uploader_id: user.id });

      if (insertError) {
        // TODO: Consider deleting uploaded file on DB error
        throw new Error(`Erro ao salvar informações do boleto: ${insertError.message}`);
      }

      enqueueSnackbar(`Boleto para ${referencePeriod} enviado com sucesso!`, { variant: 'success' }); // Success snackbar
      // Clear form
      setSelectedTenantId(''); setReferencePeriod(''); setSelectedFile(null);
      const fileInput = document.getElementById('bill-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      console.error('Error submitting bill:', err);
      enqueueSnackbar(err.message || 'Ocorreu um erro inesperado.', { variant: 'error' }); // Error snackbar
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Enviar Novo Boleto
      </Typography>

      {/* Removed Alert components */}

      {/* Form Controls remain the same, but without error/success state checks */}
       <FormControl fullWidth required margin="normal" disabled={loading || fetchLoading}>
         <InputLabel id="tenant-select-label">Selecionar Inquilino</InputLabel>
         <Select labelId="tenant-select-label" id="tenant-select" value={selectedTenantId} label="Selecionar Inquilino" onChange={handleTenantChange} >
           {fetchLoading ? (
              <>
                 <MenuItem value="" disabled><em>Carregando...</em></MenuItem>
                 <MenuItem disabled sx={{ py: 0.5 }}><Skeleton variant="text" width="80%" /></MenuItem>
                 <MenuItem disabled sx={{ py: 0.5 }}><Skeleton variant="text" width="70%" /></MenuItem>
              </>
           ) : tenants.length === 0 ? (
              <MenuItem value="" disabled><em>Nenhum inquilino encontrado.</em></MenuItem>
           ) : (
             tenants.map((tenant) => ( <MenuItem key={tenant.id} value={tenant.id}> {tenant.full_name} ({tenant.block_number}/{tenant.apartment_number || '?'}) </MenuItem> ))
           )}
         </Select>
       </FormControl>
       <TextField required fullWidth id="referencePeriod" label="Período de Referência (ex: 2025-03)" name="referencePeriod" value={referencePeriod} onChange={(e) => setReferencePeriod(e.target.value)} disabled={loading} placeholder="YYYY-MM" />
       <FormControl fullWidth margin="normal">
          <InputLabel shrink htmlFor="bill-file-input" sx={{ position: 'static', transform: 'none', mb: 1 }}> Arquivo PDF do Boleto </InputLabel>
          <Input id="bill-file-input" type="file" onChange={handleFileChange} disabled={loading} inputProps={{ accept: 'application/pdf' }} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, '&:hover': { borderColor: 'text.secondary' } }} />
          {selectedFile && <Typography variant="caption" sx={{mt: 1}}>Selecionado: {selectedFile.name}</Typography>}
       </FormControl>

      <Box sx={{ position: 'relative', mt: 3 }}>
        <Button type="submit" fullWidth variant="contained" color="primary" disabled={loading || !selectedFile || !selectedTenantId || !referencePeriod} sx={{ py: 1.2 }} >
          {loading ? 'Enviando...' : 'Enviar Boleto'}
        </Button>
        {loading && ( <CircularProgress size={24} sx={{ color: 'primary.contrastText', position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px', }} /> )}
      </Box>
    </Box>
  );
};

export default UploadBillForm;