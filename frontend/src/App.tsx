import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Admin from './pages/Admin';
import PropertyDetails from './pages/PropertyDetails'; // Dosya isminin de 'PropertyDetails.tsx' olduğundan emin ol!
import About from './pages/About';
import Learn from './pages/Learn';
import { useAuth } from './context/AuthContext';

// PrivateRoute: Giriş yapmamış kullanıcıları Login sayfasına atar
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  // BURADAKİ 'return' ÇOK ÖNEMLİ! 👇
  return (
    <BrowserRouter>
      <Routes>
        {/* --- HERKESE AÇIK SAYFALAR (PUBLIC) --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/learn" element={<Learn />} />

        {/* Mülk Detay Sayfası */}
        <Route path="/properties/:id" element={<PropertyDetails />} />

        {/* --- SADECE ÜYELERE AÇIK SAYFALAR (PRIVATE) --- */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <PrivateRoute>
              <Marketplace />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;