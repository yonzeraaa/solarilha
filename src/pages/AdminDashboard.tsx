import React from 'react';
import { Outlet, NavLink } from 'react-router-dom'; // Import NavLink, remove useLocation if unused
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton, // Re-add ListItemButton import
  ListItemIcon,
  ListItemText,
  CssBaseline,
  IconButton, // For potential icons like menu or logout
  Tooltip // For logout button
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'; // Icon for Tenant Management
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Icon for Bills
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill'; // Icon for BBQ
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles'; // Import useTheme

const drawerWidth = 240;

const AdminDashboard: React.FC = () => {
  const { signOut } = useAuth();
  const theme = useTheme(); // Get theme object
  // const navigate = useNavigate(); // No longer needed for sidebar navigation

  const handleLogout = async () => {
    await signOut();
    // AuthProvider listener will handle state change, App.tsx will redirect to /login
    console.log("Admin logged out");
  };

  // Placeholder navigation items
  const menuItems = [
    { text: 'Gerenciar Inquilinos', icon: <PeopleAltIcon />, path: '/admin/tenants' }, // Example path
    { text: 'Enviar Boletos', icon: <ReceiptLongIcon />, path: '/admin/bills' }, // Example path
    { text: 'Consultar Reservas Churrasqueira', icon: <OutdoorGrillIcon />, path: '/admin/bbq' }, // Renamed
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }} // Background handled by theme
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
            // backgroundColor: 'background.paper', // Handled by theme
            borderRight: '1px solid', // Use divider color from theme
            // borderColor: 'divider' // Handled by theme
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
           {/* Optional: Add Logo or Title here */}
           <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main' }}> {/* Use primary color */}
             Condomínio Solar da Ilha
           </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({ // Apply styles based on isActive
                  textDecoration: 'none',
                  display: 'block',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.primary, // Use theme colors
                  backgroundColor: isActive ? theme.palette.action.selected : 'transparent', // Highlight background when active
                  // Add other styles like font weight if desired
                  // fontWeight: isActive ? 'bold' : 'normal',
                })}
              >
                {/* Use ListItemButton purely for styling/layout inside NavLink */}
                <ListItemButton
                   sx={{
                     minHeight: 48,
                     justifyContent: 'initial',
                     px: 2.5,
                     '&:hover': { // Keep hover effect consistent
                        backgroundColor: theme.palette.action.hover,
                     }
                   }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 3,
                      justifyContent: 'center',
                      color: 'inherit' // Inherit color from NavLink
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: 1, color: 'inherit' }} />
                </ListItemButton>
              </NavLink>
            </ListItem>
          ))}
        </List>
        {/* Optional: Add other sections or logout button in drawer */}
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: { xs: 2, sm: 3 }, minHeight: '100vh' }} // Adjusted padding
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