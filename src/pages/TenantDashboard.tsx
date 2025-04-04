import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
  IconButton,
  Tooltip
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt'; // Icon for Bills
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill'; // Icon for BBQ
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth for logout and user info

const drawerWidth = 240;

const TenantDashboard: React.FC = () => {
  const { signOut, profile } = useAuth(); // Get profile for welcome message
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    // Redirect handled by App.tsx
  };

  // Navigation items for tenant
  const menuItems = [
    { text: 'Meus Boletos', icon: <ReceiptIcon />, path: '/tenant/bills' }, // Example path
    { text: 'Reservar Churrasqueira', icon: <OutdoorGrillIcon />, path: '/tenant/bbq' }, // Example path
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, backgroundColor: 'background.paper' }}
        elevation={1}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            Painel do Inquilino {profile?.block_number && profile?.apartment_number ? `(${profile.block_number}/${profile.apartment_number})` : ''}
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
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
           <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main' }}>
             Solar Ilha
           </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              {/* TODO: Use NavLink */}
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemIcon sx={{ color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: 'text.primary' }}/>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, minHeight: '100vh' }}
      >
        <Toolbar /> {/* Spacer */}
        <Outlet /> {/* Nested tenant routes render here */}
      </Box>
    </Box>
  );
};

export default TenantDashboard;