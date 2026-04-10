import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ message }) => (
  <div className="loading-overlay">
    <div className="loading-card glass-card-premium">
      <Loader2 className="animate-spin text-brand-primary" size={48} />
      {message && <p className="mt-4 text-lg text-slate-800">{message}</p>}
    </div>
  </div>
);

export default LoadingOverlay;
