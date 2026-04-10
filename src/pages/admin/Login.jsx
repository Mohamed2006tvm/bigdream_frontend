import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { adminService } from '../../services/api';
import gsap from 'gsap';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const cardRef = useRef(null);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (sessionStorage.getItem('token')) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    gsap.fromTo(cardRef.current, 
      { scale: 0.9, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }
    );
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await adminService.login(credentials);
      // Store token in sessionStorage (HttpOnly cookie is also set automatically)
      // sessionStorage is used to track login state client-side.
      // It's cleared when the browser tab closes (more secure than localStorage).
      sessionStorage.setItem('token', data.data.token);
      sessionStorage.setItem('admin', JSON.stringify(data.data.admin));
      
      gsap.to(cardRef.current, { 
        scale: 1.05, 
        opacity: 0, 
        duration: 0.4, 
        onComplete: () => navigate('/admin/dashboard') 
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar />
      <div className="container mx-auto px-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div 
          ref={cardRef}
          className="glass-card-premium w-full max-w-md p-10 relative isolate overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-primary/5 blur-3xl rounded-full -z-10"></div>
          
          <div className="text-center mb-10">
            <div className="inline-flex p-3 rounded-2xl bg-brand-primary/10 text-brand-primary mb-6">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl mb-2 text-slate-900">Admin <span className="text-gradient-premium">Management</span></h2>
            <p className="text-slate-500 font-medium tracking-wide translate-y-[-2px]">Secure access to venue controls</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div className="space-y-4">
              <div className="relative group">
                <User 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" 
                  size={18} 
                />
                <input
                  id="admin-username"
                  required
                  className="premium-input pl-12"
                  placeholder="Username"
                  value={credentials.username}
                  onChange={e => setCredentials({...credentials, username: e.target.value})}
                  autoComplete="username"
                />
              </div>
              
              <div className="relative group">
                <Lock 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" 
                  size={18} 
                />
                <input
                  id="admin-password"
                  required
                  type="password"
                  className="premium-input pl-12"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={e => setCredentials({...credentials, password: e.target.value})}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm" role="alert">
                <AlertCircle size={18} /> <span>{error}</span>
              </div>
            )}

            <button 
              id="admin-login-btn"
              disabled={loading} 
              type="submit" 
              className="btn-premium w-full text-lg shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
