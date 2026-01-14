import { Suspense, lazy } from 'react'; // 1. Suspense ve lazy eklendi
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// COMPONENTS
// AdminRoute genelde küçük bir wrapper olduğu için statik kalabilir, 
// ama sayfalar kesinlikle lazy olmalı.
import AdminRoute from './components/AdminRoute';

// 2. LAZY IMPORTS (Sayfalar sadece ihtiyaç duyulunca yüklenir)
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Settings = lazy(() => import('./pages/Settings'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));

// PAGES (Admin) - Lazy Load
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminWithdrawals = lazy(() => import('./pages/admin/AdminWithdrawals'));
const Properties = lazy(() => import('./pages/admin/Properties'));

// 3. LOADING COMPONENT (Yükleme sırasında dönecek spinner)
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF]"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Notification Toasts */}
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1E293B', color: '#fff', border: '1px solid #334155' },
        }} />

        {/* 4. SUSPENSE WRAPPER (Tüm rotaları sarar) */}
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/properties/:id" element={<PropertyDetails />} />

            {/* --- PROTECTED ADMIN ROUTES --- */}
            <Route element={<AdminRoute />}>

              {/* 1. Admin Ana Sayfa -> Para Yatırma (Deposit) Yönetimi */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/deposits" element={<AdminDashboard />} />

              {/* 2. Para Çekme (Withdrawal) Yönetimi */}
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />

              {/* 3. Property Yönetimi */}
              <Route path="/admin/properties" element={<Properties />} />

            </Route>

            {/* --- 404 (Not Found) --- */}
            <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-slate-500">404 - Page Not Found</div>} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;