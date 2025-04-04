import React, { useState, useEffect, ChangeEvent, useRef } from 'react'; // Added useRef
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  // Input, // No longer using MUI Input for file
  Skeleton
} from '@mui/material';

// Interface remains the same...
interface TenantProfile { id: string; full_name: string; block_number: string; apartment_number: string | null; }

const UploadBillForm: React.FC = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [tenants, setTenants] = useState<TenantProfile[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [referencePeriod, setReferencePeriod] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input

  // Fetch tenants (remains the same)
  useEffect(() => {
    const fetchTenants = async () => {
      setFetchLoading(true);
      try {
        const { data, error: fetchError } = await supabase.from('profiles').select('id, full_name, block_number, apartment_number').eq('role', 'tenant').order('full_name', { ascending: true });
        if (fetchError) throw fetchError;
        setTenants(data as TenantProfile[]);
      } catch (err: any) {
        console.error("Error fetching tenants:", err);
        enqueueSnackbar(`Erro ao carregar inquilinos: ${err.message}`, { variant: 'error' });
      } finally {
        setFetchLoading(false);
      }
    };
    fetchTenants();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTenantChange = (event: SelectChangeEvent<string>) => {
    setSelectedTenantId(event.target.value as string);
  };

  // Handle file selection from the hidden input
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        setSelectedFile(null);
        enqueueSnackbar('Por favor, selecione um arquivo PDF.', { variant: 'warning' });
      }
    } else {
      setSelectedFile(null);
    }
  };

  // Trigger hidden file input click
  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  // handleSubmit remains the same...
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTenantId || !referencePeriod || !selectedFile || !user) {
      enqueueSnackbar('Por favor, preencha todos os campos e selecione um arquivo PDF.', { variant: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const fileExtension = selectedFile.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${referencePeriod}.${fileExtension}`;
      const filePath = `${selectedTenantId}/${uniqueFileName}`;
      const { error: uploadError } = await supabase.storage.from('tenant-bills').upload(filePath, selectedFile, { cacheControl: '3600', upsert: false });
      if (uploadError) { throw new Error(`Erro no upload do arquivo: ${uploadError.message}`); }
      const { error: insertError } = await supabase.from('bills').insert({ tenant_id: selectedTenantId, file_path: filePath, reference_period: referencePeriod, uploader_id: user.id });
      if (insertError) { throw new Error(`Erro ao salvar informações do boleto: ${insertError.message}`); }
      enqueueSnackbar(`Boleto para ${referencePeriod} enviado com sucesso!`, { variant: 'success' });
      setSelectedTenantId(''); setReferencePeriod(''); setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset hidden input
    } catch (err: any) {
      console.error('Error submitting bill:', err);
      enqueueSnackbar(err.message || 'Ocorreu um erro inesperado.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Enviar Novo Boleto
      </Typography>

      {/* Tenant Selector */}
      <FormControl fullWidth required margin="normal" disabled={loading || fetchLoading}>
         <InputLabel id="tenant-select-label">Selecionar Inquilino</InputLabel>
         <Select labelId="tenant-select-label" id="tenant-select" value={selectedTenantId} label="Selecionar Inquilino" onChange={handleTenantChange} >
           {fetchLoading ? ( <> <MenuItem value="" disabled><em>Carregando...</em></MenuItem> <MenuItem disabled sx={{ py: 0.5 }}><Skeleton variant="text" width="80%" /></MenuItem> <MenuItem disabled sx={{ py: 0.5 }}><Skeleton variant="text" width="70%" /></MenuItem> </> )
            : tenants.length === 0 ? ( <MenuItem value="" disabled><em>Nenhum inquilino encontrado.</em></MenuItem> )
            : ( tenants.map((tenant) => ( <MenuItem key={tenant.id} value={tenant.id}> {tenant.full_name} ({tenant.block_number}/{tenant.apartment_number || '?'}) </MenuItem> )) )}
         </Select>
       </FormControl>

       {/* Reference Period */}
       <TextField required fullWidth id="referencePeriod" label="Período de Referência (ex: 2025-03)" name="referencePeriod" value={referencePeriod} onChange={(e) => setReferencePeriod(e.target.value)} disabled={loading} placeholder="YYYY-MM" />

       {/* Custom File Input */}
       <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" component="label" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
                Arquivo PDF do Boleto*
            </Typography>
            {/* Hidden actual file input */}
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="application/pdf"
                style={{ display: 'none' }} // Hide the default input
                id="bill-file-input-hidden"
            />
            {/* Custom Button to trigger the hidden input */}
            <Button
                variant="outlined"
                component="span" // Important for triggering input via label/button
                onClick={handleSelectFileClick}
                disabled={loading}
                size="small"
            >
                Selecionar Arquivo PDF
            </Button>
            {/* Display selected file name */}
            {selectedFile && <Typography variant="caption" sx={{ ml: 2, display: 'inline-block' }}>Selecionado: {selectedFile.name}</Typography>}
       </Box>


      {/* Submit Button */}
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