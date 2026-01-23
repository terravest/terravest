import { Suspense, lazy, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import type { LangType } from './content';

// COMPONENTS
import AdminRoute from './components/AdminRoute';

// LAZY IMPORTS
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const VerifyEmailPending = lazy(() => import('./pages/VerifyEmailPending'));
const Settings = lazy(() => import('./pages/Settings'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Learn = lazy(() => import('./pages/Learn'));
const About = lazy(() => import('./pages/About'));

// NEW LEGAL & CONTACT PAGES
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const Contact = lazy(() => import('./pages/Contact'));

// PAGES (Admin)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminWithdrawals = lazy(() => import('./pages/admin/AdminWithdrawals'));
const Properties = lazy(() => import('./pages/admin/Properties'));

// LOADING COMPONENT
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF]"></div>
  </div>
);

export const LanguageContext = createContext<LangType>('en');

type AppRoutesProps = {
  lang: LangType;
};

export function AppRoutes({ lang }: AppRoutesProps) {

  // DİL VE BAŞLIK AYARLAMALARI
  useEffect(() => {
    // 1. HTML lang niteliğini güncelle
    document.documentElement.lang = lang;

    // 2. Tarayıcı Başlığını Dile Göre Güncelle
    const titles: Record<string, string> = {
      'en': "Tokenized Fractional Real Estate Investment",
      'pt-br': "Investimento Imobiliário Fracionado Tokenizado", // Brezilya Portekizcesi
      'es': "Inversión Inmobiliaria Fraccionada Tokenizada",     // Latin Amerika İspanyolcası
      'fr': "Investissement Immobilier Fractionné Tokenisé"      // Fransızca
    };

    // Varsayılan olarak İngilizce kullan, yoksa o anki dili al
    const subtitle = titles[lang] || titles['en'];
    document.title = `TerraVest | ${subtitle}`;

  }, [lang]);

  return (
    <LanguageContext.Provider value={lang}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* --- PUBLIC / USER ROUTES --- */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="verify-email-pending" element={<VerifyEmailPending />} />

          <Route path="about" element={<About />} />
          <Route path="learn" element={<Learn />} />

          {/* LEGAL & CONTACT ROUTES */}
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="disclaimer" element={<Disclaimer />} />
          <Route path="contact" element={<Contact />} />

          {/* USER DASHBOARD */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* SETTINGS & MARKETPLACE */}
          <Route path="settings" element={<Settings />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="properties/:id" element={<PropertyDetails />} />

          {/* --- PROTECTED ADMIN ROUTES --- */}
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/deposits" element={<AdminDashboard />} />
            <Route path="admin/withdrawals" element={<AdminWithdrawals />} />
            <Route path="admin/properties" element={<Properties />} />
          </Route>

          {/* --- 404 (Not Found) --- */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-slate-500">404 - Page Not Found</div>} />
        </Routes>
      </Suspense>
    </LanguageContext.Provider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Notification Toasts */}
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1E293B', color: '#fff', border: '1px solid #334155' },
        }} />

        <Routes>
          {/* Brezilya Portekizcesi */}
          <Route path="/pt-br/*" element={<AppRoutes lang="pt-br" />} />

          {/* İspanyolca (Latin Amerika) */}
          <Route path="/es/*" element={<AppRoutes lang="es" />} />

          {/* Fransızca */}
          <Route path="/fr/*" element={<AppRoutes lang="fr" />} />

          {/* Varsayılan (İngilizce) */}
          <Route path="/*" element={<AppRoutes lang="en" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;