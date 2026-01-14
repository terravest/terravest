import { Suspense, lazy } from 'react'; // 1. Suspense and lazy added
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// COMPONENTS
// AdminRoute can remain static as it's usually a small wrapper,
// but pages must definitely be lazy loaded.
import AdminRoute from './components/AdminRoute';

// 2. LAZY IMPORTS (Pages are loaded only when needed)
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Settings = lazy(() => import('./pages/Settings'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Learn = lazy(() => import('./pages/Learn'));
const About = lazy(() => import('./pages/About'));

// PAGES (Admin) - Lazy Load
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminWithdrawals = lazy(() => import('./pages/admin/AdminWithdrawals'));
const Properties = lazy(() => import('./pages/admin/Properties'));

// 3. LOADING COMPONENT (Spinner shown during loading)
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

        {/* 4. SUSPENSE WRAPPER (Wraps all routes) */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* --- PUBLIC / USER ROUTES --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/about" element={<About />} />
            <Route path="/learn" element={<Learn />} />

            {/* USER DASHBOARD */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* SETTINGS & MARKETPLACE */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />

            {/* --- PROTECTED ADMIN ROUTES --- */}
            <Route element={<AdminRoute />}>

              {/* 1. Admin Home Page -> Deposit Management */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/deposits" element={<AdminDashboard />} />

              {/* 2. Withdrawal Management */}
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />

              {/* 3. Property Management */}
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