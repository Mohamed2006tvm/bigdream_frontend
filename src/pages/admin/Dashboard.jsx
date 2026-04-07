import React, { useState, useEffect, useRef } from 'react';
import { adminService, bookingService, settingService } from '../../services/api';
import Navbar from '../../components/Navbar';
import { 
  BarChart3, CalendarDays, Users, Clock, Edit2,
  Trash2, Filter, Loader2, LogOut, ChevronLeft, ChevronRight,
  Hammer, RotateCcw, X, AlertCircle, Plus, CheckCircle2, Mail
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { formatTimeSlot } from '../../utils/formatters';
import gsap from 'gsap';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [screens, setScreens] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [customSlot, setCustomSlot] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [slots, setSlots] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSlots, setTempSlots] = useState([]);
  const [tempIsActive, setTempIsActive] = useState(true);
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [view, setView] = useState('bookings'); // 'bookings' | 'messages'
  const [messages, setMessages] = useState([]);
  const [messageTotal, setMessageTotal] = useState(0);
  const [messagePage, setMessagePage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [availabilityConfig, setAvailabilityConfig] = useState({ mode: 'dynamic', days: 7, dates: [] });
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);

  const [manualBooking, setManualBooking] = useState({
    screen_name: 'A',
    date: format(new Date(), 'yyyy-MM-dd'),
    time_slot: '',
    customer_name: '',
    phone: '',
    email: '',
    isCustom: false
  });
  const [manualAvailability, setManualAvailability] = useState([]);

  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (view === 'messages') {
      fetchMessages();
    }
  }, [view, messagePage]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const targetUrl = apiUrl.endsWith('/api') ? `${apiUrl}/admin/messages` : `${apiUrl}/api/admin/messages`;
      
      const response = await fetch(`${targetUrl}?page=${messagePage}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages);
        setMessageTotal(data.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const targetUrl = apiUrl.endsWith('/api') ? `${apiUrl}/admin/messages/${id}/read` : `${apiUrl}/api/admin/messages/${id}/read`;

      await fetch(targetUrl, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const targetUrl = apiUrl.endsWith('/api') ? `${apiUrl}/admin/messages/${id}` : `${apiUrl}/api/admin/messages/${id}`;

      await fetch(targetUrl, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchScreens();
    fetchSlots();
    fetchAvailabilityConfig();
  }, []);

  const fetchAvailabilityConfig = async () => {
    try {
      const { data } = await adminService.getSetting('availability_config');
      if (data.data) {
        setAvailabilityConfig({
          ...data.data,
          dates: data.data.dates || []
        });
      }
    } catch (err) { console.error('Failed to fetch availability config'); }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 400);
    return () => clearTimeout(timer);
  }, [page, search]);

  useEffect(() => {
    if (isManualModalOpen && manualBooking.date) {
      fetchManualAvailability();
    }
  }, [isManualModalOpen, manualBooking.date]);

  const fetchManualAvailability = async () => {
    try {
      const { data } = await bookingService.getAvailability(manualBooking.date);
      setManualAvailability(data.data.availability || []);
    } catch (err) {
      console.error('Failed to fetch manual availability:', err);
    }
  };

  useEffect(() => {
    if (!loading && bookings.length > 0 && contentRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(contentRef.current.children, 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        );
      }, contentRef);
      return () => ctx.revert();
    }
  }, [loading, bookings]);

  const fetchSlots = async () => {
    try {
      const { data } = await settingService.getTimeSlots();
      if (data.data) {
        setSlots(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch slots');
    }
  };

  const fetchScreens = async () => {
    try {
      const { data } = await adminService.getScreens();
      setScreens(data.data);
      if (data.data.length > 0 && !selectedScreenId) {
        setSelectedScreenId(data.data[0].id);
        setTempSlots(data.data[0].time_slots);
        setTempIsActive(data.data[0].is_active !== false);
      }
    } catch (err) {
      console.error('Failed to fetch screens');
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getAllBookings(page, 20, search);
      setBookings(data.data.bookings);
      setTotal(data.data.total);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      await adminService.updateBooking(id, { status });
      fetchBookings();
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    window.location.href = '/';
  };

  useEffect(() => {
    if (editingBooking || isManualModalOpen || isSettingsOpen || isAvailabilityOpen || selectedMessage) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(modalRef.current, 
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [editingBooking, isManualModalOpen, isSettingsOpen, isAvailabilityOpen, selectedMessage]);

  const closeModal = (callback) => {
    gsap.to(modalRef.current, { 
      scale: 0.95, 
      opacity: 0, 
      duration: 0.2, 
      onComplete: () => {
        if (callback) callback();
        setEditingBooking(null);
        setIsManualModalOpen(false);
        setIsSettingsOpen(false);
        setIsAvailabilityOpen(false);
        setSelectedMessage(null);
        setEditError('');
      } 
    });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
  };

  return (
    <div className="min-h-screen bg-bg-main pb-24">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fade-in">
          <div>
            <h2 className="text-4xl mb-2 text-slate-900">Admin <span className="text-gradient-premium">Dashboard</span></h2>
            <p className="text-slate-500 font-medium">Welcome back, <span className="text-brand-primary font-bold">{JSON.parse(localStorage.getItem('admin'))?.username || 'Admin'}</span></p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setView(view === 'bookings' ? 'messages' : 'bookings')} className="btn-outline-premium group">
              {view === 'bookings' ? <Mail className="text-brand-primary" size={18} /> : <CalendarDays className="text-brand-primary" size={18} />}
              {view === 'bookings' ? 'View Messages' : 'View Bookings'}
            </button>
            <button onClick={() => {
              setIsAvailabilityOpen(true);
              setIsSettingsOpen(false);
              setIsManualModalOpen(false);
              setSelectedMessage(null);
            }} className="btn-outline-premium group">
              <CalendarDays className="text-brand-primary" size={18} /> Booking Window
            </button>
            <button onClick={() => {
              setIsSettingsOpen(true);
              setIsAvailabilityOpen(false);
              setIsManualModalOpen(false);
              setSelectedMessage(null);
            }} className="btn-outline-premium group">
              <Clock className="text-brand-primary group-hover:rotate-12 transition-transform" size={18} /> Shift Settings
            </button>
            <button onClick={() => {
              setIsManualModalOpen(true);
              setIsAvailabilityOpen(false);
              setIsSettingsOpen(false);
              setSelectedMessage(null);
            }} className="btn-premium group">
              <Plus className="group-hover:rotate-90 transition-transform" size={18} /> Manual Booking
            </button>
            <button onClick={handleLogout} className="btn-outline-premium border-red-100 text-red-500 hover:bg-red-50">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        <div ref={contentRef}>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 opacity-0">
            {[
              { 
                label: view === 'bookings' ? 'Total Bookings' : 'Total Messages', 
                value: view === 'bookings' ? total : messageTotal, 
                icon: view === 'bookings' ? <CalendarDays size={24} className="text-brand-primary" /> : <Mail size={24} className="text-brand-primary" /> 
              },
              { 
                label: view === 'bookings' ? 'Today Reservations' : 'Unread Inquiries', 
                value: view === 'bookings' ? bookings.filter(b => b.date.startsWith(format(new Date(), 'yyyy-MM-dd'))).length : messages.filter(m => !m.is_read).length, 
                icon: <Clock size={24} className={view === 'bookings' ? "text-emerald-400" : "text-amber-400"} /> 
              },
              { label: 'Active Screens', value: screens.length || 3, icon: <BarChart3 size={24} className="text-brand-accent" /> }
            ].map((stat, i) => (
              <div key={i} className="glass-card-premium p-8 flex items-center gap-6 group hover:translate-y-[-4px] transition-transform">
                <div className="p-4 rounded-2xl bg-brand-primary/5 border border-pink-100/50 group-hover:bg-brand-primary/10 transition-colors">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold font-sans tracking-tight text-slate-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {view === 'bookings' ? (
          /* Booking Table */
          <div className="glass-card-premium overflow-hidden border-white/5 opacity-0">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.02]">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-brand-primary" /> Recent Bookings
                </h3>
                <p className="text-xs text-slate-400 font-bold tracking-wide">Showing {bookings.length} of {total} results</p>
              </div>

              <div className="relative w-full max-w-sm group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-primary transition-colors">
                  <Filter size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by name, email or phone..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full bg-white border border-pink-100 rounded-xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Screen</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Date & Time</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Customer</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Status</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan="5" className="py-24 text-center"><Loader2 className="animate-spin inline-block text-brand-primary" size={40} /></td></tr>
                  ) : bookings.length === 0 ? (
                    <tr><td colSpan="5" className="py-24 text-center text-slate-500 font-medium">No bookings found in vault.</td></tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-pink-50/20 transition-colors group">
                        <td className="px-8 py-6">
                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-primary/5 text-brand-primary border border-pink-100 text-sm font-bold">
                             Screen {b.screen_name}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-slate-800 font-bold font-sans">{format(new Date(b.date), 'dd MMM yyyy')}</div>
                          <div className="text-brand-accent text-xs font-bold uppercase tracking-wide flex items-center gap-1 mt-1">
                            <Clock size={12} /> {formatTimeSlot(b.time_slot)}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-slate-800 font-bold">{b.customer_name}</div>
                          <div className="text-slate-400 text-xs font-bold font-mono mt-1">{b.phone}</div>
                        </td>
                        <td className="px-8 py-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                          b.is_completed ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                          (b.status === 'booked' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                          (b.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' : 
                          'bg-amber-50 text-amber-600 border border-amber-100'))
                        }`}>
                          {b.is_completed ? 'completed' : b.status}
                        </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingBooking(b);
                                setCustomSlot(b.time_slot);
                                setIsCustom(!slots.includes(b.time_slot));
                                setIsAvailabilityOpen(false);
                                setIsSettingsOpen(false);
                                setIsManualModalOpen(false);
                                setSelectedMessage(null);
                              }}
                              className="p-2 rounded-lg bg-white border border-pink-100 shadow-sm hover:bg-brand-primary/5 hover:border-brand-primary/30 text-slate-400 hover:text-brand-primary transition-all"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            {b.status === 'booked' ? (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                disabled={actionLoading === b.id}
                                className="p-2 rounded-lg bg-white border border-pink-100 shadow-sm hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 transition-all"
                                title="Cancel"
                              >
                                {actionLoading === b.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'booked')}
                                disabled={actionLoading === b.id}
                                className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 transition-all"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'maintenance')}
                              className="p-2 rounded-lg bg-white border border-pink-100 shadow-sm hover:bg-amber-50 hover:border-amber-200 text-slate-400 hover:text-amber-500 transition-all"
                              title="Maintenance"
                            >
                              <Hammer size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 bg-slate-50/50 border-t border-pink-100/50 flex justify-center gap-6">
              <button 
                disabled={page === 1 || loading} 
                onClick={() => setPage(p => p - 1)} 
                className="btn-outline-premium px-4 py-2 text-xs"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <div className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                Page <span className="text-brand-primary mx-2">{page}</span>
              </div>
              <button 
                disabled={bookings.length < 20 || loading} 
                onClick={() => setPage(p => p + 1)} 
                className="btn-outline-premium px-4 py-2 text-xs"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
          ) : (
          /* Messages Table */
          <div className="glass-card-premium overflow-hidden border-white/5 opacity-0">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.02]">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-normal flex items-center gap-3">
                  <Mail size={20} className="text-brand-primary" /> Customer Inquiries
                </h3>
                <p className="text-xs text-slate-400 font-bold tracking-wide">Showing {messages.length} of {messageTotal} messages</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Sender</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Snippet</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Date</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Status</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan="5" className="py-24 text-center"><Loader2 className="animate-spin inline-block text-brand-primary" size={40} /></td></tr>
                  ) : messages.length === 0 ? (
                    <tr><td colSpan="5" className="py-24 text-center text-slate-500 font-medium">No messages in inbox.</td></tr>
                  ) : (
                    messages.map((m) => (
                      <tr key={m.id} className={`hover:bg-pink-50/20 transition-colors group ${!m.is_read ? 'bg-brand-primary/[0.02]' : ''}`}>
                        <td className="px-8 py-6">
                           <div className="text-slate-800 font-bold">{m.name}</div>
                           <div className="text-slate-400 text-xs font-medium">{m.email}</div>
                        </td>
                        <td className="px-8 py-6 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-sm text-slate-500 font-medium">
                          {m.message}
                        </td>
                        <td className="px-8 py-6 text-sm text-slate-400 font-bold">
                          {format(new Date(m.created_at), 'dd MMM, HH:mm')}
                        </td>
                        <td className="px-8 py-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                          m.is_read ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-brand-primary/10 text-brand-primary border border-pink-200'
                        }`}>
                          {m.is_read ? 'read' : 'new'}
                        </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                               onClick={() => {
                                 setSelectedMessage(m);
                                 setIsAvailabilityOpen(false);
                                 setIsSettingsOpen(false);
                                 setIsManualModalOpen(false);
                               }}
                               className="p-2 rounded-lg bg-white border border-pink-100 shadow-sm hover:bg-brand-primary/5 hover:border-brand-primary/30 text-slate-400 hover:text-brand-primary transition-all"
                            >
                               <Filter size={16} />
                            </button>
                            <button
                               onClick={() => deleteMessage(m.id)}
                               className="p-2 rounded-lg bg-white border border-pink-100 shadow-sm hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 transition-all"
                            >
                               <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 bg-slate-50/50 border-t border-pink-100/50 flex justify-center gap-6">
              <button 
                disabled={messagePage === 1 || loading} 
                onClick={() => setMessagePage(p => p - 1)} 
                className="btn-outline-premium px-4 py-2 text-xs"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <div className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                Page <span className="text-brand-primary mx-2">{messagePage}</span>
              </div>
              <button 
                disabled={messages.length < 20 || loading} 
                onClick={() => setMessagePage(p => p + 1)} 
                className="btn-outline-premium px-4 py-2 text-xs"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Modals Overlay */}
        {(editingBooking || isManualModalOpen || isSettingsOpen || isAvailabilityOpen || selectedMessage) && (
          <div 
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-pink-900/40 backdrop-blur-md opacity-0"
            onClick={() => closeModal()}
          >
            <div 
              ref={modalRef}
              className="glass-card-premium w-full max-w-lg p-10 relative isolate overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => closeModal()} 
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-pink-50 transition-colors text-slate-400"
              >
                <X size={20} />
              </button>

              {/* Message Details Modal Content */}
              {selectedMessage && (
                <>
                  <div className="mb-10">
                    <div className="inline-block px-3 py-1 rounded bg-brand-primary/5 text-brand-primary text-[10px] font-black tracking-widest uppercase mb-4">INQUIRY DETAILS</div>
                    <h3 className="text-3xl mb-1 text-slate-900">{selectedMessage.name}</h3>
                    <p className="text-brand-primary font-bold text-sm">{selectedMessage.email}</p>
                    <p className="text-slate-400 text-xs mt-1 font-medium">{format(new Date(selectedMessage.created_at), 'PPPP p')}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-pink-100/50 leading-relaxed text-slate-700 whitespace-pre-wrap text-sm italic">
                      "{selectedMessage.message}"
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button onClick={() => closeModal()} className="btn-outline-premium flex-1">Close</button>
                      {!selectedMessage.is_read && (
                        <button
                          onClick={() => {
                            markMessageAsRead(selectedMessage.id);
                            closeModal();
                          }}
                          className="btn-premium flex-[2]"
                        >
                          <CheckCircle2 size={18} /> Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Edit Booking Modal Content */}
              {editingBooking && (
                <>
                  <div className="mb-10">
                    <div className="inline-block px-3 py-1 rounded bg-brand-primary/5 text-brand-primary text-[10px] font-black tracking-widest uppercase mb-4">RE-SCHEDULE</div>
                    <h3 className="text-3xl mb-2 text-slate-900">Modify Slot</h3>
                    <p className="text-slate-500 font-medium text-sm">Updating for <span className="text-brand-primary font-bold">{editingBooking.customer_name}</span></p>
                  </div>

                  <div className="space-y-8">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-pink-100/50 flex justify-between items-center">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Screen</div>
                      <div className="font-bold text-brand-primary">Screen {editingBooking.screen_name}</div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time Slot</label>
                        <button 
                            onClick={() => setIsCustom(!isCustom)} 
                            className="text-[10px] font-black text-brand-primary uppercase tracking-wider hover:underline transition-all"
                        >
                            {isCustom ? 'Quick Select' : 'Custom Entry'}
                        </button>
                      </div>

                      {!isCustom ? (
                        <div className="grid grid-cols-2 gap-3">
                          {(screens.find(s => s.name === editingBooking.screen_name)?.time_slots || slots).map((slot) => (
                            <button
                              key={slot}
                              onClick={() => {
                                setIsAvailabilityOpen(false);
                                setIsSettingsOpen(false);
                                setIsManualModalOpen(false);
                                setSelectedMessage(null);
                                setEditingBooking({ ...editingBooking, time_slot: slot });
                              }}
                              className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 ${
                                editingBooking.time_slot === slot 
                                ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-pink-500/20 scale-[1.02]' 
                                : 'bg-white border-pink-100 text-slate-600 hover:bg-pink-50'
                              }`}
                            >
                              <Clock size={14} /> {slot}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="premium-input font-mono uppercase"
                          placeholder="HH:MM-HH:MM"
                          value={customSlot}
                          onChange={(e) => {
                            setCustomSlot(e.target.value);
                            setEditingBooking({ ...editingBooking, time_slot: e.target.value });
                          }}
                        />
                      )}
                    </div>

                    {editError && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                        {editError}
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button onClick={() => closeModal()} className="btn-outline-premium flex-1">Cancel</button>
                      <button
                        disabled={editLoading}
                        onClick={async () => {
                          setEditLoading(true);
                          try {
                            await adminService.updateBooking(editingBooking.id, { time_slot: editingBooking.time_slot });
                            closeModal(() => fetchBookings());
                          } catch (err) {
                            setEditError(err.response?.data?.message || 'Update failed');
                          } finally {
                            setEditLoading(false);
                          }
                        }}
                        className="btn-premium flex-[2]"
                      >
                        {editLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Manual Booking Modal Content */}
              {isManualModalOpen && (
                <>
                  <div className="mb-10">
                    <div className="inline-block px-3 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest uppercase mb-4">BYPASS ENGINE</div>
                    <h3 className="text-3xl mb-2 text-slate-900">Manual Entry</h3>
                    <p className="text-slate-500 font-medium text-sm">Force book a slot directly into the system.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Screen</label>
                        <select 
                          className="premium-input" 
                          value={manualBooking.screen_name}
                          onChange={e => setManualBooking({...manualBooking, screen_name: e.target.value, time_slot: ''})}
                        >
                          {screens.map(s => <option key={s.id} value={s.name} className="bg-bg-card">Screen {s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Date</label>
                        <input 
                          type="date" 
                          className="premium-input [color-scheme:light]" 
                          value={manualBooking.date}
                          onChange={e => setManualBooking({...manualBooking, date: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Time Slot</label>
                        <button 
                          onClick={() => setManualBooking({...manualBooking, isCustom: !manualBooking.isCustom, time_slot: ''})}
                          className="text-[10px] font-black text-brand-primary uppercase tracking-wider hover:underline transition-all"
                        >
                          {manualBooking.isCustom ? 'Select Available' : 'Custom Entry'}
                        </button>
                      </div>

                      {manualBooking.isCustom ? (
                        <input 
                          type="text" 
                          placeholder="HH:MM-HH:MM"
                          className="premium-input font-mono uppercase" 
                          value={manualBooking.time_slot}
                          onChange={e => setManualBooking({...manualBooking, time_slot: e.target.value})}
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 scrollbar-none">
                          {(() => {
                            const screenData = manualAvailability.find(a => a.screen_name === manualBooking.screen_name);
                            if (!screenData) return <div className="col-span-2 py-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Slots...</div>;
                            
                            const availableSlots = screenData.time_slots.filter(slot => 
                              !screenData.slots.some(s => s.time_slot === slot)
                            );

                            if (availableSlots.length === 0) return <div className="col-span-2 py-4 text-center text-red-400 text-xs font-bold uppercase tracking-widest">No Slots Available</div>;

                            return availableSlots.map(slot => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setManualBooking({...manualBooking, time_slot: slot})}
                                className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                  manualBooking.time_slot === slot 
                                  ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-pink-500/20 scale-[1.02]' 
                                  : 'bg-white border-pink-100 text-slate-600 hover:bg-pink-50'
                                }`}
                              >
                                <Clock size={12} /> {slot}
                              </button>
                            ));
                          })()}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Customer Name</label>
                      <input 
                        type="text" 
                        className="premium-input" 
                        placeholder="Internal Guest"
                        value={manualBooking.customer_name}
                        onChange={e => setManualBooking({...manualBooking, customer_name: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Phone</label>
                        <input 
                          type="text" 
                          className="premium-input" 
                          placeholder="+000 000000"
                          value={manualBooking.phone}
                          onChange={e => setManualBooking({...manualBooking, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Email</label>
                        <input 
                          type="email" 
                          className="premium-input" 
                          placeholder="internal@vault.io"
                          value={manualBooking.email}
                          onChange={e => setManualBooking({...manualBooking, email: e.target.value})}
                        />
                      </div>
                    </div>

                    {editError && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                        {editError}
                      </div>
                    )}

                    <div className="flex gap-4 pt-6">
                      <button onClick={() => closeModal()} className="btn-outline-premium flex-1">Cancel</button>
                      <button
                        disabled={actionLoading === 'manual-booking'}
                        onClick={async () => {
                          setActionLoading('manual-booking');
                          try {
                            await adminService.manualBooking(manualBooking);
                            closeModal(() => {
                                fetchBookings();
                                setManualBooking({
                                    screen_name: 'A',
                                    date: format(new Date(), 'yyyy-MM-dd'),
                                    time_slot: '',
                                    customer_name: '',
                                    phone: '',
                                    email: '',
                                    isCustom: false
                                });
                            });
                          } catch (err) {
                            setEditError(err.response?.data?.message || 'Manual entry failed');
                          } finally {
                            setActionLoading(null);
                          }
                        }}
                        className="btn-premium flex-[2]"
                      >
                        {actionLoading === 'manual-booking' ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Reservation'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Shift Settings Modal Content */}
              {isSettingsOpen && (
                <>
                  <div className="mb-10">
                    <div className="inline-block px-3 py-1 rounded bg-amber-50 text-amber-600 text-[10px] font-black tracking-widest uppercase mb-4">CONFIGURATION</div>
                    <h3 className="text-3xl mb-2 text-slate-900">Shift Control</h3>
                    <p className="text-slate-500 font-medium text-sm">Define operational windows for each screen.</p>
                  </div>

                  <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    {screens.map((s) => (
                      <button 
                        key={s.id}
                        onClick={() => {
                          setSelectedScreenId(s.id);
                          setTempSlots(s.time_slots);
                          setTempIsActive(s.is_active !== false);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          selectedScreenId === s.id 
                          ? 'bg-brand-primary text-white shadow-lg shadow-pink-500/20' 
                          : 'bg-white text-slate-500 border border-pink-100 hover:bg-pink-50'
                        }`}
                      >
                        Screen {s.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-slate-50 border border-pink-100">
                    <input 
                      type="checkbox" 
                      checked={tempIsActive} 
                      onChange={(e) => setTempIsActive(e.target.checked)}
                      className="w-5 h-5 accent-brand-primary"
                    />
                    <span className="text-sm font-bold text-slate-700">Screen Active Status</span>
                  </div>

                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-none">
                    {tempSlots.map((slot, i) => (
                      <div key={i} className="group relative">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2 pl-4">Window 0{i + 1}</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="text" 
                            className="premium-input font-mono flex-1 uppercase"
                            value={slot}
                            onChange={(e) => {
                              const newSlots = [...tempSlots];
                              newSlots[i] = e.target.value;
                              setTempSlots(newSlots);
                            }}
                          />
                          <button 
                            onClick={() => setTempSlots(tempSlots.filter((_, idx) => idx !== i))}
                            className="p-3 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => setTempSlots([...tempSlots, "00:00-00:00"])}
                      className="w-full py-4 rounded-2xl border-2 border-dashed border-pink-100 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-brand-primary/50 hover:text-brand-primary transition-all bg-slate-50/50"
                    >
                      <Plus size={18} /> Append Operation Window
                    </button>
                  </div>

                  {editError && (
                    <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                      {editError}
                    </div>
                  )}

                  <div className="flex gap-4 pt-10">
                    <button onClick={() => closeModal()} className="btn-outline-premium flex-1">Discard</button>
                    <button
                      disabled={actionLoading === 'sync-shifts'}
                      onClick={async () => {
                        setActionLoading('sync-shifts');
                        try {
                          await adminService.updateScreenSlots(selectedScreenId, tempSlots, tempIsActive);
                          await fetchScreens();
                          closeModal();
                        } catch (err) { setEditError('Failed to sync shifts'); }
                        finally { setActionLoading(null); }
                      }}
                      className="btn-premium flex-[2]"
                    >
                      {actionLoading === 'sync-shifts' ? <Loader2 className="animate-spin" size={20} /> : 'Synchronize Shifts'}
                    </button>
                  </div>
                </>
              )}

              {/* Availability Management Modal Content */}
              {isAvailabilityOpen && (
                <>
                  <div className="mb-10">
                    <div className="inline-block px-3 py-1 rounded bg-brand-primary/5 text-brand-primary text-[10px] font-black tracking-widest uppercase mb-4">AVAILABILITY</div>
                    <h3 className="text-3xl font-black mb-2 tracking-tight text-slate-900">Booking Window</h3>
                    <p className="text-slate-500 font-medium text-sm">Control which dates are open for reservation.</p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-4">Operation Mode</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setAvailabilityConfig({...availabilityConfig, mode: 'dynamic'})}
                          className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                            availabilityConfig.mode === 'dynamic' 
                            ? 'bg-brand-primary/5 border-brand-primary text-brand-primary' 
                            : 'bg-white border-pink-100 text-slate-400 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <RotateCcw size={24} />
                          <span className="font-bold text-sm">Dynamic</span>
                        </button>
                        <button 
                          onClick={() => setAvailabilityConfig({...availabilityConfig, mode: 'manual'})}
                          className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                            availabilityConfig.mode === 'manual' 
                            ? 'bg-brand-primary/5 border-brand-primary text-brand-primary' 
                            : 'bg-white border-pink-100 text-slate-400 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Edit2 size={24} />
                          <span className="font-bold text-sm">Manual</span>
                        </button>
                      </div>
                    </div>

                    {availabilityConfig.mode === 'dynamic' ? (
                      <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Visible Days Ahead</label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="number"
                            min="1"
                            max="90"
                            className="premium-input text-center text-2xl font-black w-32"
                            value={availabilityConfig.days}
                            onChange={(e) => setAvailabilityConfig({...availabilityConfig, days: parseInt(e.target.value)})}
                          />
                          <p className="text-slate-500 font-medium">Days from today</p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-4 italic uppercase tracking-wider">Note: The system will automatically roll forward each day.</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Authorized Dates</label>
                          <button 
                            onClick={() => {
                               const currentDates = availabilityConfig.dates || [];
                               const newDate = format(addDays(new Date(), currentDates.length), 'yyyy-MM-dd');
                               setAvailabilityConfig({...availabilityConfig, dates: [...currentDates, newDate]});
                            }}
                            className="text-[10px] font-black text-brand-primary tracking-widest uppercase hover:underline"
                          >
                            + Append Date
                          </button>
                        </div>
                        <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 scrollbar-none">
                          {availabilityConfig.dates.map((date, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input 
                                type="date"
                                className="premium-input [color-scheme:light] font-mono text-sm"
                                value={date}
                                onChange={(e) => {
                                  const newDates = [...availabilityConfig.dates];
                                  newDates[idx] = e.target.value;
                                  setAvailabilityConfig({...availabilityConfig, dates: newDates});
                                }}
                              />
                              <button 
                                onClick={() => setAvailabilityConfig({...availabilityConfig, dates: availabilityConfig.dates.filter((_, i) => i !== idx)})}
                                className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {editError && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                        {editError}
                      </div>
                    )}

                    <div className="flex gap-4 pt-10">
                      <button onClick={() => closeModal()} className="btn-outline-premium flex-1">Discard</button>
                      <button
                        disabled={editLoading}
                        onClick={async () => {
                          setEditLoading(true);
                          try {
                            await adminService.updateSetting('availability_config', availabilityConfig);
                            closeModal(() => {
                              fetchAvailabilityConfig();
                            });
                          } catch (err) {
                            setEditError(err.response?.data?.message || 'Update failed');
                          } finally {
                            setEditLoading(false);
                          }
                        }}
                        className="btn-premium flex-[2]"
                      >
                        {editLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Availability Settings'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
