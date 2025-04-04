import React from 'react';
import { Outlet, NavLink } from 'react-router-dom'; // Import NavLink, remove useNavigate
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
  IconButton,
  Tooltip
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt'; // Icon for Bills
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useTheme } from '@mui/material/styles'; // Import useTheme to access theme in style function
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth for logout and user info

const drawerWidth = 240;

const TenantDashboard: React.FC = () => {
  const { signOut, profile } = useAuth();
  const theme = useTheme(); // Get theme object
  // const navigate = useNavigate(); // No longer needed for sidebar navigation

  const handleLogout = async () => {
    await signOut();
    // Redirect handled by App.tsx
  };

  // Navigation items for tenant
  const menuItems = [
    { text: 'Meus Boletos', icon: <ReceiptIcon />, path: '/tenant/bills' },
    { text: 'Reservar Churrasqueira', icon: <OutdoorGrillIcon />, path: '/tenant/bbq' },
    { text: 'Alterar Senha', icon: <VpnKeyIcon />, path: '/tenant/change-password' }, // Add Change Password item
    // { text: 'Reservar Churrasqueira', icon: <OutdoorGrillIcon />, path: '/tenant/bbq' }, // Removed duplicate
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }} // Background handled by theme
        elevation={1}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            Painel do Inquilino
            {profile?.full_name ? ` - ${profile.full_name}` : ''}
            {profile?.block_number && profile?.apartment_number ? ` (${profile.block_number}/${profile.apartment_number})` : ''}
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
            borderRight: '1px solid',
            // borderColor: 'divider' // Handled by theme
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
           <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main' }}>
             Condomínio Solar
           </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  display: 'block',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                  backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
                })}
              >
                <ListItemButton
                   sx={{
                     minHeight: 48,
                     justifyContent: 'initial',
                     px: 2.5,
                     '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                     }
                   }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 3,
                      justifyContent: 'center',
                      color: 'inherit'
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
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: { xs: 2, sm: 3 }, minHeight: '100vh' }} // Adjusted padding
      >
        <Toolbar /> {/* Spacer */}
        <Outlet /> {/* Nested tenant routes render here */}
      </Box>
    </Box>
  );
};

export default TenantDashboard;