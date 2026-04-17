import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://bigdream-backend.vercel.app/api';
      // Normalize URL (avoid double /api)
      const targetUrl = apiUrl.endsWith('/api') ? `${apiUrl}/contact` : `${apiUrl}/api/contact`;
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Ideas received! We\'ll start planning soon.' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        const errorMsg = data.errors ? data.errors.map(e => e.msg).join(', ') : (data.message || 'Failed to send message');
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitStatus({ type: 'error', message: err.message || 'Failed to send message' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main leading-relaxed relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-60 pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.1)_0%,_rgba(139,92,246,0.05)_40%,_transparent_70%)]"></div>

      <Navbar />
      
      <div className="container mx-auto px-6 py-16 md:py-24 animate-fade-in relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-normal mb-6 tracking-tighter text-slate-800 drop-shadow-[0_10px_10px_rgba(0,0,0,0.02)]">
            Plan the <span className="text-gradient-premium">Ultimate Celebration</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl mx-auto">
            Ready to create a magical moment? Tell us about your celebration idea, and our team of experts will help you bring it to life.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-3 bg-white p-10 md:p-12 rounded-[32px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
            <h2 className="text-3xl font-normal text-slate-900 mb-8 tracking-tight">Your <span className="text-gradient-premium">Celebration Idea</span></h2>
            
            <form className="space-y-6 text-left" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name" 
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all font-medium text-slate-700 text-sm placeholder:text-slate-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email address" 
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all font-medium text-slate-700 text-sm placeholder:text-slate-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Tell us about your celebration vision..." 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all font-medium text-slate-700 text-sm placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>

              {submitStatus?.type === 'success' && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl text-sm font-semibold border border-emerald-100 animate-in fade-in slide-in-from-top-1">
                  <CheckCircle2 size={18} />
                  {submitStatus.message}
                </div>
              )}

              {submitStatus?.type === 'error' && (
                <div className="text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm font-semibold border border-red-100 animate-in fade-in slide-in-from-top-1">
                  {submitStatus.message}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl shadow-lg shadow-pink-500/25 hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 transition-all mt-4 font-semibold text-base flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={18} />
                    Send Idea
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Info Cards */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Contact Details Card */}
            <div className="bg-white p-10 md:p-10 rounded-[32px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] text-left flex-1">
              <h2 className="text-2xl font-normal text-slate-800 font-display mb-8">Dream Concierge</h2>
              <div className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
                    <Phone size={18} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-slate-500">+91 89391 67064</span>
                </div>
                
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
                    <Mail size={18} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-slate-500">mydreamsurprise26@gmail.com</span>
                </div>
                
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
                    <MapPin size={18} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-slate-500">Chennai</span>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-white p-10 md:p-10 rounded-[32px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] text-left">
              <h2 className="text-xl font-normal text-slate-800 font-display mb-4">Planning Hours</h2>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Mon – Sat: 9:00 AM – 12:00 AM</p>
                <p className="text-sm font-medium text-slate-500">Sun: 09:00 AM – 12:00 AM</p>
                <p className="text-xs font-bold text-brand-primary mt-4 uppercase tracking-wider">Celebrations available 24/7</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
