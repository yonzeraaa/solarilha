import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material'; // For loading indicator

interface ProtectedRouteProps {
  allowedRoles: Array<'admin' | 'tenant'>;
  children?: React.ReactNode; // Allow wrapping routes directly or using Outlet
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, profile, loading: authLoading } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking auth state or fetching profile
  if (authLoading || (user && !profile)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not logged in, redirect to login page, saving the intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in but role doesn't match allowed roles, redirect to login (or an unauthorized page)
  if (!profile || !allowedRoles.includes(profile.role)) {
    console.warn(`Unauthorized access attempt to ${location.pathname} by user with role: ${profile?.role}`);
    // Redirecting to login might be confusing if already logged in.
    // Consider an Unauthorized page or redirecting based on role later.
    // For now, redirecting to login clears the state.
    return <Navigate to="/login" replace />;
    // Alternative: return <Navigate to="/unauthorized" replace />;
  }

  // If authorized, render the child component or Outlet
  // Using Outlet is common when defining protected routes in App.tsx layout
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;