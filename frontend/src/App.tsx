import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// COMPONENTS
import AdminRoute from './components/AdminRoute';
// import Navbar from './components/Navbar'; // Optional global navbar

// PAGES (General)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard'; // ✅ IMPORTED DASHBOARD
import Marketplace from './pages/Marketplace'; // ✅ IMPORTED MARKETPLACE

// PAGES (Admin)
import Admin from './pages/admin/Admin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDeposits from './pages/admin/AdminDeposits';

// ⚠️ If AdminProperties exists, uncomment the line below
// import AdminProperties from './pages/admin/AdminProperties';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Notification Toasts */}
        <Toaster position="top-right" />

        <Routes>
          {/* --- PUBLIC / USER ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ✅ USER DASHBOARD ROUTE (This was missing!) */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ✅ SETTINGS & MARKETPLACE */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/marketplace" element={<Marketplace />} />

          {/* --- PROTECTED ADMIN ROUTES --- */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/deposits" element={<AdminDeposits />} />

            {/* ⚠️ If AdminProperties exists, uncomment the line below */}
            {/* <Route path="/admin/properties" element={<AdminProperties />} /> */}
          </Route>

          {/* --- 404 (Not Found) --- */}
          <Route path="*" element={<div className="p-10 text-center text-slate-500">404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;