import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import TenantDashboard from './pages/TenantDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ManageTenants from './components/admin/ManageTenants'; // Import admin components
import UploadBills from './components/admin/UploadBills';
import ReserveBBQ from './components/admin/ReserveBBQ'; // Admin version
import TenantReserveBBQ from './components/tenant/TenantReserveBBQ'; // Import tenant version
import ViewBills from './components/tenant/ViewBills'; // Import tenant component
import { useAuth } from './contexts/AuthContext'; // Import useAuth to check status
import { Box, CircularProgress } from '@mui/material'; // For initial loading state

// Component to handle initial loading and redirection
function RootRedirect() {
  const { user, profile, loading } = useAuth();
  console.log('RootRedirect Check:', { loading, user: !!user, profile }); // Add logging

  // AuthContext now handles loading state accurately for both auth and profile fetch
  if (loading) {
    console.log(`RootRedirect: Waiting... AuthLoading: ${loading}`);
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  // If loading is false, proceed with redirection logic

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
    return <Navigate to="/admin" replace />; // Redirect to the base admin path
  } else if (profile?.role === 'tenant') {
    console.log('RootRedirect: Tenant role found, redirecting to /tenant/dashboard');
    return <Navigate to="/tenant/bills" replace />; // Redirect directly to default tenant view
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
          {/* Wrap admin routes within the AdminDashboard layout component */}
          <Route path="/admin" element={<AdminDashboard />}>
            {/* Index route for the dashboard itself (optional content) */}
            {/* <Route index element={<AdminOverview />} /> */}
            <Route path="tenants" element={<ManageTenants />} />
            <Route path="bills" element={<UploadBills />} />
            <Route path="bbq" element={<ReserveBBQ />} />
            {/* Redirect base /admin/dashboard to a default section, e.g., tenants */}
            <Route index element={<Navigate to="tenants" replace />} />
            {/* Add other admin-only routes here, nested under /admin */}
        </Route> {/* Closes the /admin AdminDashboard layout route */}
       </Route> {/* Closes the ProtectedRoute for admin */}

        {/* Protected Tenant Route */}
        <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
          {/* Wrap tenant routes within the TenantDashboard layout component */}
          <Route path="/tenant" element={<TenantDashboard />}>
             <Route path="bills" element={<ViewBills />} />
             <Route path="bbq" element={<TenantReserveBBQ />} /> {/* Add route for tenant BBQ */}
             {/* Redirect base /tenant/dashboard to a default section, e.g., bills */}
             <Route index element={<Navigate to="bills" replace />} />
          </Route>
            {/* Add other tenant-only routes here, nested under /tenant */}
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
