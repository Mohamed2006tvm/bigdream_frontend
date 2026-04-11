import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import './App.css';

// ─── Lazy-load all pages (code splitting) ────────────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Availability = lazy(() => import('./pages/Availability'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ─── Page Loading Fallback ────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg-main">
    <Loader2 className="animate-spin text-brand-primary" size={48} />
  </div>
);

// ─── Scroll Restoration ───────────────────────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// ─── Admin Keyboard Shortcut (Alt+Shift+X) ───────────────────────────────────
const ShortcutHandler = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'x') {
        event.preventDefault();
        navigate('/admin/login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
  return null;
};

// ─── Protected Route ─────────────────────────────────────────────────────────
// Checks sessionStorage for a token fallback; primary auth is via HttpOnly cookie.
// The server will reject requests with invalid/missing cookies anyway.
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  // If no token in sessionStorage, redirect to login.
  // The HttpOnly cookie will authenticate server requests automatically.
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
};

const AppInner = () => {
  return (
    <Router>
      <ScrollToTop />
      <ShortcutHandler />
      <div className="app-wrapper">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/book" element={<Availability />} />
            <Route path="/contact" element={<Contact />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

function App() {
  return <AppInner />;
}


export default App;
