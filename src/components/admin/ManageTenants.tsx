import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import RegisterTenantForm from './RegisterTenantForm'; // Import the form

const ManageTenants: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Gerenciar Inquilinos</Typography>

      {/* Registration Form Section */}
      <Paper sx={{ p: 3, mb: 3 }}> {/* Wrap form in Paper for visual separation */}
        <RegisterTenantForm />
      </Paper>

      {/* TODO: Add Tenant List Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Inquilinos Cadastrados</Typography>
        <Typography variant="body2" color="text.secondary">
          (A lista de inquilinos será implementada aqui.)
        </Typography>
        {/* Placeholder for a table or list of tenants */}
      </Paper>

    </Box>
  );
};

export default ManageTenants;