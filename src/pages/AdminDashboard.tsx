import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; // Import Outlet for nested routes
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  IconButton, // For potential icons like menu or logout
  Tooltip // For logout button
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'; // Icon for Tenant Management
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Icon for Bills
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill'; // Icon for BBQ
import LogoutIcon from '@mui/icons-material/Logout'; // Icon for Logout
import { useAuth } from '../contexts/AuthContext'; // Import useAuth for logout

const drawerWidth = 240;

const AdminDashboard: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate(); // For navigation on logout

  const handleLogout = async () => {
    await signOut();
    // AuthProvider listener will handle state change, App.tsx will redirect to /login
    console.log("Admin logged out");
  };

  // Placeholder navigation items
  const menuItems = [
    { text: 'Gerenciar Inquilinos', icon: <PeopleAltIcon />, path: '/admin/tenants' }, // Example path
    { text: 'Enviar Boletos', icon: <ReceiptLongIcon />, path: '/admin/bills' }, // Example path
    { text: 'Reservar Churrasqueira', icon: <OutdoorGrillIcon />, path: '/admin/bbq' }, // Example path
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, backgroundColor: 'background.paper' }} // Use paper color for AppBar
        elevation={1} // Subtle elevation
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            Painel do Administrador
          </Typography>
          <Tooltip title="Sair">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon sx={{ color: 'text.secondary' }}/>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper', // Consistent background
            borderRight: '1px solid', // Use divider color from theme
            borderColor: 'divider'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
           {/* Optional: Add Logo or Title here */}
           <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main' }}> {/* Use primary color */}
             Solar Ilha
           </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              {/* TODO: Use NavLink from react-router-dom for active styling */}
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemIcon sx={{ color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: 'text.primary' }}/>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {/* Optional: Add other sections or logout button in drawer */}
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, minHeight: '100vh' }} // Use default background for content area
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {/* Nested routes will render here */}
        <Outlet />
        {/* Default content if no nested route matches */}
        {/* <Typography paragraph>
          Selecione uma opção no menu lateral.
        </Typography> */}
      </Box>
    </Box>
  );
};

export default AdminDashboard;