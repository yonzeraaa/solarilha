import React, { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext'; // To get uploader ID
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
  SelectChangeEvent,
  Input // For file input styling
} from '@mui/material';

// Interface for Tenant profile data
interface TenantProfile {
  id: string;
  full_name: string;
  block_number: string;
}

const UploadBillForm: React.FC = () => {
  const { user } = useAuth(); // Get current admin user
  const [tenants, setTenants] = useState<TenantProfile[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [referencePeriod, setReferencePeriod] = useState<string>(''); // e.g., "YYYY-MM"
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true); // Loading state for tenants
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch tenants on component mount
  useEffect(() => {
    const fetchTenants = async () => {
      setFetchLoading(true);
      setError(null);
      try {
        // Assuming admins can read all profiles based on RLS
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, full_name, block_number')
          .eq('role', 'tenant') // Only fetch tenants
          .order('full_name', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }
        setTenants(data as TenantProfile[]);
      } catch (err: any) {
        console.error("Error fetching tenants:", err);
        setError(`Erro ao carregar inquilinos: ${err.message}`);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const handleTenantChange = (event: SelectChangeEvent<string>) => {
    setSelectedTenantId(event.target.value as string);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setError(null); // Clear previous file errors
      } else {
        setSelectedFile(null);
        setError('Por favor, selecione um arquivo PDF.');
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTenantId || !referencePeriod || !selectedFile || !user) {
      setError('Por favor, preencha todos os campos e selecione um arquivo PDF.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Construct file path (ensure uniqueness)
      const fileExtension = selectedFile.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${referencePeriod}.${fileExtension}`;
      // Structure: tenant_id/year/month/unique_filename.pdf (adjust as needed)
      // Example using just tenant_id and unique name for simplicity:
      const filePath = `${selectedTenantId}/${uniqueFileName}`;

      // 2. Upload file to Supabase Storage
      console.log(`Uploading file to: ${filePath}`);
      const { error: uploadError } = await supabase.storage
        .from('tenant-bills') // Bucket name
        .upload(filePath, selectedFile, {
          cacheControl: '3600', // Optional: Cache control
          upsert: false // Don't overwrite existing files with the same name (should be unique anyway)
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(`Erro no upload do arquivo: ${uploadError.message}`);
      }

      console.log('File uploaded successfully.');

      // 3. Insert record into 'bills' table
      const { error: insertError } = await supabase
        .from('bills')
        .insert({
          tenant_id: selectedTenantId,
          file_path: filePath,
          reference_period: referencePeriod,
          uploader_id: user.id // Record who uploaded it
        });

      if (insertError) {
        console.error('Error inserting bill record:', insertError);
        // TODO: Consider deleting the uploaded file if DB insert fails (rollback logic)
        throw new Error(`Erro ao salvar informações do boleto: ${insertError.message}`);
      }

      setSuccess(`Boleto para ${referencePeriod} enviado com sucesso para o inquilino selecionado.`);
      // Clear form
      setSelectedTenantId('');
      setReferencePeriod('');
      setSelectedFile(null);
      // Reset file input visually (requires accessing the input element)
      const fileInput = document.getElementById('bill-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';


    } catch (err: any) {
      console.error('Error submitting bill:', err);
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Enviar Novo Boleto
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <FormControl fullWidth required margin="normal" disabled={loading || fetchLoading}> {/* Use margin prop */}
        <InputLabel id="tenant-select-label">Selecionar Inquilino</InputLabel>
        <Select
          labelId="tenant-select-label"
          id="tenant-select"
          value={selectedTenantId}
          label="Selecionar Inquilino"
          onChange={handleTenantChange}
        >
          {fetchLoading ? (
            <MenuItem value="" disabled><em>Carregando inquilinos...</em></MenuItem>
          ) : tenants.length === 0 ? (
             <MenuItem value="" disabled><em>Nenhum inquilino encontrado.</em></MenuItem>
          ) : (
            tenants.map((tenant) => (
              <MenuItem key={tenant.id} value={tenant.id}>
                {tenant.full_name} ({tenant.block_number})
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <TextField
        required
        fullWidth
        id="referencePeriod"
        label="Período de Referência (ex: 2025-03)"
        name="referencePeriod"
        value={referencePeriod}
        onChange={(e) => setReferencePeriod(e.target.value)}
        disabled={loading}
        sx={{ mb: 2 }}
        placeholder="YYYY-MM"
      />

      <FormControl fullWidth margin="normal"> {/* Use margin prop */}
         <InputLabel shrink htmlFor="bill-file-input" sx={{ position: 'static', transform: 'none', mb: 1 }}>
           Arquivo PDF do Boleto
         </InputLabel>
         <Input
           id="bill-file-input"
           type="file"
           onChange={handleFileChange}
           disabled={loading}
           inputProps={{ accept: 'application/pdf' }} // Accept only PDF
           sx={{
             // Basic styling for file input
             border: '1px solid',
             borderColor: 'divider',
             borderRadius: 1,
             p: 1,
             '&:hover': { borderColor: 'text.secondary' }
           }}
         />
         {selectedFile && <Typography variant="caption" sx={{mt: 1}}>Selecionado: {selectedFile.name}</Typography>}
      </FormControl>


      <Box sx={{ position: 'relative', mt: 3 }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading || !selectedFile || !selectedTenantId || !referencePeriod}
          sx={{ py: 1.2 }}
        >
          {loading ? 'Enviando...' : 'Enviar Boleto'}
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

export default UploadBillForm;