import React from 'react';
import { Typography, Box, Paper, Divider } from '@mui/material'; // Added Divider
import RegisterTenantForm from './RegisterTenantForm';
import TenantList from './TenantList'; // Import the list component

const ManageTenants: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Gerenciar Inquilinos</Typography>

      {/* Registration Form Section */}
      <Paper sx={{ p: 3, mb: 3 }}> {/* Wrap form in Paper for visual separation */}
        <RegisterTenantForm />
      </Paper>

      <Divider sx={{ my: 4 }} /> {/* Add a visual separator */}

      {/* Tenant List Section */}
      {/* Paper styling is handled within TenantList now */}
      <TenantList />
      {/* Removed redundant Paper wrapper and placeholder text */}
    </Box>
  );
};

export default ManageTenants;