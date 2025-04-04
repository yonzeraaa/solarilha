import React from 'react';
import { Typography, Box, Paper, Divider } from '@mui/material'; // Added Divider
import UploadBillForm from './UploadBillForm';
import BillList from './BillList'; // Import the list component

const UploadBills: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Enviar Boletos</Typography>

      <Paper sx={{ p: 3, mb: 3 }}> {/* Wrap form in Paper */}
        <UploadBillForm />
      </Paper>

      <Divider sx={{ my: 4 }} /> {/* Add a visual separator */}

      {/* Bill List Section */}
      {/* Paper styling is handled within BillList now */}
      <BillList />
      {/* Removed redundant Paper wrapper and placeholder text */}
    </Box>
  );
};

export default UploadBills;