import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Navigate gereksizse sildim
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// COMPONENTS
import AdminRoute from './components/AdminRoute';
// import Navbar from './components/Navbar'; 

// PAGES (General)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';

// PAGES (Admin)
// import Admin from './pages/admin/Admin'; // Eğer Admin.tsx layout değilse gerek yok
import AdminDashboard from './pages/admin/AdminDashboard'; // Depositler burada
import AdminWithdrawals from './pages/admin/AdminWithdrawals'; // Çekimler burada

// ❌ SİLİNDİ: import AdminDeposits from './pages/admin/AdminDeposits'; 

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

          {/* USER DASHBOARD */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* SETTINGS & MARKETPLACE */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/marketplace" element={<Marketplace />} />

          {/* --- PROTECTED ADMIN ROUTES --- */}
          <Route element={<AdminRoute />}>

            {/* 1. Admin Ana Sayfa -> Para Yatırma (Deposit) Yönetimi */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/deposits" element={<AdminDashboard />} />

            {/* 2. Para Çekme (Withdrawal) Yönetimi */}
            {/* Düzeltme: Başına /admin eklendi */}
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />

          </Route>

          {/* --- 404 (Not Found) --- */}
          <Route path="*" element={<div className="p-10 text-center text-slate-500">404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;