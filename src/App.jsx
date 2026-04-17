import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// ─── Lazy-load all pages (code splitting) ────────────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Availability = lazy(() => import('./pages/Availability'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const popupSlides = [
  '/assests/Screens/Screen1.1.jpeg',
  '/assests/Screens/Screen2.1.jpeg',
  '/assests/Screens/Screen3.1.jpeg',
  '/assests/Screens/Screen1.3.jpeg',
  '/assests/Screens/Screen2.3.jpeg',
  '/assests/Screens/Screen3.3.jpeg',
];

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
  const [showEntryPopup, setShowEntryPopup] = useState(false);
  const [isPopupMinimized, setIsPopupMinimized] = useState(false);
  const [popupSlideIndex, setPopupSlideIndex] = useState(0);

  useEffect(() => {
    const popupSeen = sessionStorage.getItem('global_entry_popup_seen');
    if (popupSeen === '1') {
      setIsPopupMinimized(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowEntryPopup(true);
      sessionStorage.setItem('global_entry_popup_seen', '1');
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showEntryPopup) return undefined;
    const timer = setInterval(() => {
      setPopupSlideIndex((prev) => (prev + 1) % popupSlides.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [showEntryPopup]);

  const minimizePopup = () => {
    setShowEntryPopup(false);
    setIsPopupMinimized(true);
  };

  return (
    <Router>
      <ScrollToTop />
      <ShortcutHandler />
      <AnimatePresence>
        {showEntryPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-900/45 backdrop-blur-sm px-5 flex items-center justify-center"
            onClick={minimizePopup}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-white rounded-[30px] p-5 sm:p-6 shadow-2xl border border-pink-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5">
                <div className="relative h-36 sm:h-44 rounded-2xl overflow-hidden border border-pink-100 shadow-sm">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={popupSlideIndex}
                      src={popupSlides[popupSlideIndex]}
                      alt={`Celebration preview ${popupSlideIndex + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </AnimatePresence>
                </div>
              </div>
              <div className="inline-flex px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black tracking-widest uppercase mb-4">
                Special Offer
              </div>
              <h3 className="text-3xl font-normal text-slate-900 tracking-tight mb-3">
                Plan your celebration now
              </h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-7">
                Reserve your preferred slot early and get the best theme and timing for your event.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={minimizePopup}
                  className="btn-outline-premium w-full sm:flex-1"
                >
                  Minimize
                </button>
                <Link
                  to="/book"
                  onClick={minimizePopup}
                  className="btn-premium w-full sm:flex-[2] flex items-center justify-center gap-2"
                >
                  Book now <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPopupMinimized && (
          <motion.button
            type="button"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => {
              setShowEntryPopup(true);
              setIsPopupMinimized(false);
            }}
            className="fixed right-3 md:right-5 bottom-4 md:bottom-6 z-[85] bg-brand-primary text-white rounded-l-2xl rounded-r-md px-3 py-4 shadow-xl shadow-pink-500/35 hover:opacity-95 transition-opacity"
            aria-label="Open booking offer popup"
          >
            <span className="flex items-center gap-2">
              <ChevronUp size={16} />
              <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                Book now
              </span>
              <ChevronDown size={16} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

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
