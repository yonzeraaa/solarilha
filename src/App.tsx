import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard'; // Import AdminDashboard
import TenantDashboard from './pages/TenantDashboard'; // Import TenantDashboard
// import TenantDashboard from './pages/TenantDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Basic Dashboard Routes (will need protection later) */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/tenant/dashboard" element={<TenantDashboard />} />

        {/* Placeholder routes for dashboards (to be implemented later) */}
        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
        {/* <Route path="/tenant/dashboard" element={<TenantDashboard />} /> */}

        {/* Default route: Redirect to login page for now */}
        {/* In a real app, this might redirect based on auth status */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
