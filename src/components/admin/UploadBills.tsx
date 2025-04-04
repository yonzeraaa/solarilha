import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import UploadBillForm from './UploadBillForm'; // Import the form

const UploadBills: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Enviar Boletos</Typography>

      <Paper sx={{ p: 3, mb: 3 }}> {/* Wrap form in Paper */}
        <UploadBillForm />
      </Paper>

      {/* TODO: Add section to list previously uploaded bills */}
      <Paper sx={{ p: 3 }}>
         <Typography variant="h6" gutterBottom>Boletos Enviados</Typography>
         <Typography variant="body2" color="text.secondary">
           (A lista de boletos enviados será implementada aqui.)
         </Typography>
         {/* Placeholder for a table/list */}
       </Paper>

    </Box>
  );
};

export default UploadBills;