import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  useEffect(() => {
    document.title = 'Page not found | My Big Dream';
  }, []);

  return (
    <div className="min-h-screen bg-bg-main flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center max-w-lg"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary/80 mb-4">
            404
          </p>
          <h1 className="text-4xl md:text-5xl font-normal text-slate-800 mb-4 tracking-tight">
            This page drifted away
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            The link may be wrong or the page was moved. Head back home or reach out if you need a hand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-brand-primary text-white font-semibold shadow-lg shadow-brand-primary/25 hover:opacity-95 transition-opacity"
            >
              <Home size={18} aria-hidden />
              Back to home
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border-2 border-slate-200 text-slate-700 font-semibold hover:border-brand-primary/40 hover:text-brand-primary transition-colors"
            >
              <ArrowLeft size={18} aria-hidden />
              Contact us
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
