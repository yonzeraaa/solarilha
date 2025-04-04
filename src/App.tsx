import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import TenantDashboard from './pages/TenantDashboard';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import { useAuth } from './contexts/AuthContext'; // Import useAuth to check status
import { Box, CircularProgress } from '@mui/material'; // For initial loading state

// Component to handle initial loading and redirection
function RootRedirect() {
  const { user, profile, loading } = useAuth();
  console.log('RootRedirect Check:', { loading, user: !!user, profile }); // Add logging

  if (loading) {
    console.log('RootRedirect: Auth loading...');
    // Show loading indicator while determining auth state/role
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    console.log('RootRedirect: No user, redirecting to /login');
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Logged in, redirect based on role
  // Logged in, check profile role
  console.log('RootRedirect: User exists, checking profile role:', profile?.role);
  if (profile?.role === 'admin') {
    console.log('RootRedirect: Admin role found, redirecting to /admin/dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  } else if (profile?.role === 'tenant') {
    console.log('RootRedirect: Tenant role found, redirecting to /tenant/dashboard');
    return <Navigate to="/tenant/dashboard" replace />;
  } else {
    // Logged in but role unknown or not set? Fallback to login for safety.
    console.warn('RootRedirect: Role unknown or missing, redirecting to /login. Profile:', profile);
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Route */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          {/* Routes nested under ProtectedRoute will only render if authorized */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Add other admin-only routes here */}
        </Route>

        {/* Protected Tenant Route */}
        <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
          <Route path="/tenant/dashboard" element={<TenantDashboard />} />
          {/* Add other tenant-only routes here */}
        </Route>

        {/* Root path handler */}
        <Route path="/" element={<RootRedirect />} />

        {/* Catch-all: Redirect any other unknown paths to the root handler */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
