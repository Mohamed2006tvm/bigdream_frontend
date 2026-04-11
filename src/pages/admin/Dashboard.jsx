import React, { useState, useEffect, useRef } from 'react';
import { adminService, bookingService, settingService } from '../../services/api';
import Navbar from '../../components/Navbar';
import { 
  BarChart3, CalendarDays, Users, Clock, Edit2,
  Trash2, Filter, Loader2, LogOut, ChevronLeft, ChevronRight,
  Hammer, RotateCcw, X, AlertCircle, Plus, CheckCircle2, Mail, KeyRound, Eye, EyeOff
} from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdVisible, setPwdVisible] = useState({ current: false, newPwd: false, confirm: false });

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
      const { data } = await adminService.getMessages(messagePage);
      if (data.success) {
        setMessages(data.data.messages);
        setMessageTotal(data.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (id) => {
    try {
      await adminService.updateBooking ? null : null; // keep import used
      // Use the API service directly
      const api = (await import('../../services/api')).default;
      await api.patch(`/admin/messages/${id}/read`);
      fetchMessages();
    } catch (err) { console.error('Failed to mark message as read', err); }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const api = (await import('../../services/api')).default;
      await api.delete(`/admin/messages/${id}`);
      fetchMessages();
    } catch (err) { console.error('Failed to delete message', err); }
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
    if (view === 'bookings') {
      const timer = setTimeout(() => {
        fetchBookings();
      }, search ? 400 : 0);
      return () => clearTimeout(timer);
    }
  }, [page, search, view]);

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
    if (loading || !contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current.children,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
      );
    }, contentRef);
    return () => ctx.revert();
  }, [loading, view]);

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
    } catch (err) {
      console.error('Failed to fetch bookings', err);
      setBookings([]);
      setTotal(0);
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

  const handleLogout = async () => {
    try {
      await adminService.logout(); // clears HttpOnly cookie on server
    } catch {
      // ignore — still clear local state
    } finally {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('admin');
      window.location.href = '/';
    }
  };

  useEffect(() => {
    if (editingBooking || isManualModalOpen || isSettingsOpen || isAvailabilityOpen || selectedMessage || isPasswordModalOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(modalRef.current, 
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [editingBooking, isManualModalOpen, isSettingsOpen, isAvailabilityOpen, selectedMessage, isPasswordModalOpen]);

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
        setIsPasswordModalOpen(false);
        setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPwdVisible({ current: false, newPwd: false, confirm: false });
        setPwdError('');
        setPwdSuccess('');
        setEditError('');
      } 
    });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
  };

  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card-premium p-8 flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-slate-100 skeleton-shimmer w-14 h-14"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3 w-16 bg-slate-100 skeleton-shimmer rounded"></div>
            <div className="h-8 w-24 bg-slate-100 skeleton-shimmer rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const MobileCardSkeleton = () => (
    <div className="p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 rounded-2xl bg-white border border-pink-100/50 space-y-4">
          <div className="flex justify-between">
            <div className="h-6 w-20 bg-slate-50 skeleton-shimmer rounded-lg"></div>
            <div className="h-6 w-24 bg-slate-50 skeleton-shimmer rounded-lg"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-1/2 bg-slate-50 skeleton-shimmer rounded"></div>
            <div className="h-3 w-1/3 bg-slate-50 skeleton-shimmer rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const TableSkeleton = ({ cols }) => (
    <tbody className="divide-y divide-white/5">
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-8 py-8">
              <div className="h-4 bg-slate-50 skeleton-shimmer rounded w-full"></div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className="min-h-screen bg-bg-main pb-24">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-12 animate-fade-in">
          <div>
            <h2 className="text-3xl md:text-4xl mb-2 text-slate-900">Admin <span className="text-gradient-premium">Dashboard</span></h2>
            <p className="text-slate-500 font-medium text-sm md:text-base">Welcome back, <span className="text-brand-primary font-bold">{JSON.parse(sessionStorage.getItem('admin'))?.username || 'Admin'}</span></p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:flex xl:flex-wrap gap-3 md:gap-4 w-full xl:w-auto">
            <button
              onClick={() => setView(view === 'bookings' ? 'messages' : 'bookings')}
              className="btn-outline-premium group w-full xl:w-auto justify-start md:justify-center px-4 md:px-6"
            >
              {view === 'bookings' ? <Mail className="text-brand-primary" size={18} /> : <CalendarDays className="text-brand-primary" size={18} />}
              <span className="text-sm font-bold">{view === 'bookings' ? 'View Messages' : 'View Bookings'}</span>
            </button>
            <button onClick={() => {
              setIsAvailabilityOpen(true);
              setIsSettingsOpen(false);
              setIsManualModalOpen(false);
              setIsPasswordModalOpen(false);
              setSelectedMessage(null);
            }} className="btn-outline-premium group w-full xl:w-auto justify-start md:justify-center px-4 md:px-6">
              <CalendarDays className="text-brand-primary" size={18} /> 
              <span className="text-sm font-bold">Booking Window</span>
            </button>
            <button onClick={() => {
              setIsSettingsOpen(true);
              setIsAvailabilityOpen(false);
              setIsManualModalOpen(false);
              setIsPasswordModalOpen(false);
              setSelectedMessage(null);
            }} className="btn-outline-premium group w-full xl:w-auto justify-start md:justify-center px-4 md:px-6">
              <Clock className="text-brand-primary group-hover:rotate-12 transition-transform" size={18} /> 
              <span className="text-sm font-bold">Shift Settings</span>
            </button>
            <button onClick={() => {
              setIsManualModalOpen(true);
              setIsAvailabilityOpen(false);
              setIsSettingsOpen(false);
              setIsPasswordModalOpen(false);
              setSelectedMessage(null);
            }} className="btn-premium group w-full xl:w-auto justify-start md:justify-center px-4 md:px-6">
              <Plus className="group-hover:rotate-90 transition-transform" size={18} /> 
              <span className="text-sm font-bold text-white">Manual Booking</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPasswordModalOpen(true);
                setIsAvailabilityOpen(false);
                setIsSettingsOpen(false);
                setIsManualModalOpen(false);
                setSelectedMessage(null);
                setEditingBooking(null);
                setPwdVisible({ current: false, newPwd: false, confirm: false });
                setPwdError('');
                setPwdSuccess('');
              }}
              className="btn-outline-premium group w-full xl:w-auto justify-start md:justify-center px-4 md:px-6"
            >
              <KeyRound className="text-brand-primary" size={18} />
              <span className="text-sm font-bold">Change password</span>
            </button>
            <button onClick={handleLogout} className="btn-outline-premium border-red-100 text-red-500 hover:bg-red-50 w-full xl:w-auto justify-start md:justify-center px-4 md:px-6">
              <LogOut size={18} /> 
              <span className="text-sm font-bold">Logout</span>
            </button>
          </div>
        </header>

        <div ref={contentRef}>
          {/* Stats Grid */}
          {loading && screens.length === 0 ? <StatsSkeleton /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
              { 
                label: view === 'bookings' ? 'Total Bookings' : 'Total Messages', 
                value: view === 'bookings' ? total : messageTotal, 
                icon: view === 'bookings' ? <CalendarDays size={24} className="text-brand-primary" /> : <Mail size={24} className="text-brand-primary" /> 
              },
              { 
                label: view === 'bookings' ? 'Today Reservations' : 'Unread Inquiries', 
                value: view === 'bookings' ? bookings.filter(b => isSameDay(new Date(b.date), new Date())).length : messages.filter(m => !m.is_read).length, 
                icon: <Clock size={24} className={view === 'bookings' ? "text-emerald-400" : "text-amber-400"} /> 
              },
              { label: 'Active Screens', value: screens.filter(s => s.is_active !== false).length, icon: <BarChart3 size={24} className="text-brand-accent" /> }
            ].map((stat, i) => (
              <div key={i} className="glass-card-premium p-8 flex items-center gap-6 group hover:translate-y-[-4px] transition-transform shadow-sm hover:shadow-md">
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
        )}

          {view === 'bookings' ? (
          /* Booking Table */
          <div className="glass-card-premium overflow-hidden border-white/5">
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
              {/* Desktop Table */}
              <table className="hidden md:table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Screen</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Date & Time</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Customer</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Status</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50 text-right">Actions</th>
                  </tr>
                </thead>
                {loading ? <TableSkeleton cols={5} /> : bookings.length === 0 ? (
                  <tbody className="divide-y divide-white/5">
                    <tr><td colSpan="5" className="py-24 text-center text-slate-500 font-medium">No bookings found in vault.</td></tr>
                  </tbody>
                ) : (
                  <tbody className="divide-y divide-white/5">
                    {bookings.map((b) => {
                        const today = new Date();
                        const bookingDate = new Date(b.date);
                        const isToday = isSameDay(bookingDate, today);
                        const isPastDay = bookingDate < new Date(today.setHours(0,0,0,0));
                        const endTime = b.time_slot.split('-')[1];
                        const currentTime = format(new Date(), 'HH:mm');
                        const isFinishedToday = isToday && endTime < currentTime;
                        const isCompleted = isPastDay || isFinishedToday;

                        return (
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
                                isCompleted ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                                (b.status === 'booked' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                (b.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' : 
                                'bg-amber-50 text-amber-600 border border-amber-100'))
                              }`}>
                                {isCompleted ? 'completed' : b.status}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                {!isCompleted && (
                                  <button
                                    onClick={() => {
                                      setEditingBooking(b);
                                      setCustomSlot(b.time_slot);
                                      setIsCustom(!slots.includes(b.time_slot));
                                      setIsAvailabilityOpen(false);
                                      setIsSettingsOpen(false);
                                      setIsManualModalOpen(false);
                                      setIsPasswordModalOpen(false);
                                      setSelectedMessage(null);
                                    }}
                                    className="p-2 rounded-lg bg-white border border-pink-100 shadow-sm hover:bg-brand-primary/5 hover:border-brand-primary/30 text-slate-400 hover:text-brand-primary transition-all"
                                    title="Edit"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                )}
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {loading ? <MobileCardSkeleton /> : bookings.length === 0 ? (
                  <div className="py-24 text-center text-slate-500 font-medium">No bookings found in vault.</div>
                ) : (
                  <div className="divide-y divide-pink-100/30">
                    {bookings.map((b) => {
                      const today = new Date();
                      const bookingDate = new Date(b.date);
                      const isToday = isSameDay(bookingDate, today);
                      const isPastDay = bookingDate < new Date(today.setHours(0,0,0,0));
                      const isCompleted = isPastDay || (isToday && b.time_slot.split('-')[1] < format(new Date(), 'HH:mm'));

                      return (
                        <div key={b.id} className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="px-3 py-1 rounded-lg bg-brand-primary/5 text-brand-primary border border-pink-100 text-xs font-bold">
                              Screen {b.screen_name}
                            </div>
                            <span className={`inline-flex px-2 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                              isCompleted ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                              (b.status === 'booked' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                              (b.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'))
                            }`}>
                              {isCompleted ? 'completed' : b.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</div>
                              <div className="text-sm font-bold text-slate-800">{format(new Date(b.date), 'dd MMM yyyy')}</div>
                              <div className="text-brand-accent text-xs font-bold">{formatTimeSlot(b.time_slot)}</div>
                            </div>
                            <div className="text-left xs:text-right">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</div>
                              <div className="text-sm font-bold text-slate-800">{b.customer_name}</div>
                              <div className="text-slate-400 text-xs font-mono">{b.phone}</div>
                            </div>
                          </div>
                          {!isCompleted && (
                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => {
                                  setEditingBooking(b);
                                  setCustomSlot(b.time_slot);
                                  setIsCustom(!slots.includes(b.time_slot));
                                  setIsAvailabilityOpen(false);
                                  setIsSettingsOpen(false);
                                  setIsManualModalOpen(false);
                                  setIsPasswordModalOpen(false);
                                  setSelectedMessage(null);
                                }}
                                className="w-full xs:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold border border-slate-100 active:scale-95 transition-all"
                              >
                                <Edit2 size={14} /> Edit Re-Schedule
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
          <div className="glass-card-premium overflow-hidden border-white/5">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.02]">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-normal flex items-center gap-3">
                  <Mail size={20} className="text-brand-primary" /> Customer Inquiries
                </h3>
                <p className="text-xs text-slate-400 font-bold tracking-wide">Showing {messages.length} of {messageTotal} messages</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <table className="hidden md:table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Sender</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Message</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Date</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-pink-100/50">Status</th>
                  </tr>
                </thead>
                {loading ? <TableSkeleton cols={4} /> : (
                  <tbody className="divide-y divide-white/5">
                    {messages.length === 0 ? (
                      <tr><td colSpan="4" className="py-24 text-center text-slate-500 font-medium">No messages in inbox.</td></tr>
                    ) : (
                      messages.map((m) => (
                        <tr key={m.id} className={`hover:bg-pink-50/20 transition-colors group ${!m.is_read ? 'bg-brand-primary/[0.02]' : ''}`}>
                          <td className="px-8 py-6">
                             <div className="text-slate-800 font-bold">{m.name}</div>
                             <div className="text-slate-400 text-xs font-medium">{m.email}</div>
                          </td>
                          <td className="px-8 py-6 max-w-sm">
                            <div 
                              className="text-slate-600 text-sm font-medium line-clamp-2 cursor-pointer hover:text-brand-primary transition-colors"
                              onClick={() => {
                                setIsPasswordModalOpen(false);
                                setSelectedMessage(m);
                                if (!m.is_read) {
                                  adminService.toggleInquiryRead(m.id, true).then(() => fetchMessages());
                                }
                              }}
                            >
                              {m.message}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-slate-400 text-xs font-bold">{format(new Date(m.created_at), 'dd MMM, HH:mm')}</div>
                          </td>
                          <td className="px-8 py-6">
                            <button
                              onClick={() => {
                                adminService.toggleInquiryRead(m.id, !m.is_read).then(() => fetchMessages());
                              }}
                              className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer ${
                                m.is_read ? 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200' : 'bg-pink-50 text-brand-primary border border-pink-100 hover:bg-pink-100'
                              }`}
                            >
                              {m.is_read ? 'read' : 'new'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                )}
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {loading ? <MobileCardSkeleton /> : messages.length === 0 ? (
                  <div className="py-24 text-center text-slate-500 font-medium">No messages in inbox.</div>
                ) : (
                  <div className="divide-y divide-pink-100/30">
                    {messages.map((m) => (
                      <div key={m.id} className={`p-6 space-y-4 ${!m.is_read ? 'bg-brand-primary/[0.02]' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-bold text-slate-800">{m.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{m.email}</div>
                          </div>
                          <button
                            onClick={() => {
                              adminService.toggleInquiryRead(m.id, !m.is_read).then(() => fetchMessages());
                            }}
                            className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                              m.is_read ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-pink-50 text-brand-primary border-pink-100'
                            }`}
                          >
                            {m.is_read ? 'read' : 'new'}
                          </button>
                        </div>
                        <div 
                          className="p-4 rounded-2xl bg-white border border-pink-100/30 text-xs font-medium text-slate-600 line-clamp-3 leading-relaxed active:bg-slate-50 transition-colors"
                          onClick={() => {
                            setIsPasswordModalOpen(false);
                            setSelectedMessage(m);
                            if (!m.is_read) {
                              adminService.toggleInquiryRead(m.id, true).then(() => fetchMessages());
                            }
                          }}
                        >
                          {m.message}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Received {format(new Date(m.created_at), 'dd MMM yyyy, HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
        {(editingBooking || isManualModalOpen || isSettingsOpen || isAvailabilityOpen || selectedMessage || isPasswordModalOpen) && (
          <div 
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-pink-900/40 backdrop-blur-md opacity-0"
            onClick={() => closeModal()}
          >
            <div 
              ref={modalRef}
              className={`${selectedMessage ? 'bg-white rounded-[40px] max-w-xl' : 'glass-card-premium max-w-lg'} w-full p-6 md:p-10 relative isolate animate-in zoom-in-95 duration-300 shadow-2xl shadow-black/20 overflow-y-auto max-h-[90vh]`}
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => closeModal()} 
                className="absolute top-8 right-8 p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 transition-all z-20"
              >
                <X size={20} />
              </button>

              {/* Message Details Modal Content (Premium Version) */}
              {selectedMessage && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-10">
                    <div className="inline-flex px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black tracking-[0.2em] uppercase mb-4 border border-brand-primary/20">
                      Customer Inquiry
                    </div>
                    <h2 className="text-3xl font-normal text-slate-900 tracking-tight leading-tight">
                      Inquiry from <span className="text-gradient-premium">{selectedMessage.name}</span>
                    </h2>
                  </div>

                  <div className="space-y-8 bg-slate-50/50 p-8 rounded-3xl border border-pink-100/50">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email</div>
                        <div className="text-sm font-bold text-slate-700 select-all">{selectedMessage.email}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date Received</div>
                        <div className="text-sm font-bold text-slate-700">{format(new Date(selectedMessage.created_at), 'dd MMM yyyy, HH:mm')}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Message Details</div>
                      <div className="text-slate-600 text-base leading-relaxed font-medium bg-white p-6 rounded-2xl border border-pink-100/30 shadow-sm max-h-[300px] overflow-y-auto break-words">
                        {selectedMessage.message}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-end">
                    <button 
                      onClick={() => closeModal()}
                      className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95 transition-all"
                    >
                      Close Inquiry
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Booking Modal Content */}
              {editingBooking && (
                <>
                  <div className="mb-10 pt-2">
                    <div className="inline-block px-3 py-1 rounded bg-brand-primary/5 text-brand-primary text-[10px] font-black tracking-widest uppercase mb-4 border border-pink-100/50">RE-SCHEDULE</div>
                    <h3 className="text-2xl md:text-3xl mb-2 text-slate-900">Modify Slot</h3>
                    <p className="text-slate-500 font-medium text-xs md:text-sm">Updating for <span className="text-brand-primary font-bold">{editingBooking.customer_name}</span></p>
                  </div>

                  <div className="space-y-8">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-pink-100/50 flex justify-between items-center">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Hall</div>
                      <select 
                        className="bg-transparent font-bold text-brand-primary outline-none cursor-pointer"
                        value={editingBooking.screen_id}
                        onChange={(e) => {
                          const screenId = e.target.value;
                          const screenName = screens.find(s => s.id === screenId)?.name || '';
                          setEditingBooking({ ...editingBooking, screen_id: screenId, screen_name: screenName });
                        }}
                      >
                        {screens.map(s => (
                          <option key={s.id} value={s.id}>Screen {s.name}</option>
                        ))}
                      </select>
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
                                setIsPasswordModalOpen(false);
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

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-2">
                      <button onClick={() => closeModal()} className="btn-outline-premium w-full sm:flex-1 order-2 sm:order-1">Cancel</button>
                      <button
                        disabled={editLoading}
                        onClick={async () => {
                          setEditLoading(true);
                          try {
                            await adminService.updateBooking(editingBooking.id, { 
                              time_slot: editingBooking.time_slot,
                              screen_id: editingBooking.screen_id
                            });
                            closeModal(() => fetchBookings());
                          } catch (err) {
                            setEditError(err.response?.data?.message || 'Update failed');
                          } finally {
                            setEditLoading(false);
                          }
                        }}
                        className="btn-premium w-full sm:flex-[2] order-1 sm:order-2 px-4 py-4"
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
                  <div className="mb-10 pt-2">
                    <div className="inline-block px-3 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest uppercase mb-4 border border-emerald-100/50">BYPASS ENGINE</div>
                    <h3 className="text-2xl md:text-3xl mb-2 text-slate-900">Manual Entry</h3>
                    <p className="text-slate-500 font-medium text-xs md:text-sm">Force book a slot directly into the system.</p>
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

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
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

                    <div className="flex flex-col sm:flex-row gap-3 pt-8 pb-4">
                      <button onClick={() => closeModal()} className="btn-outline-premium w-full sm:flex-1 order-2 sm:order-1">Cancel</button>
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
                        className="btn-premium w-full sm:flex-[2] order-1 sm:order-2 px-4 py-4"
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
                  <div className="mb-10 pt-2">
                    <div className="inline-block px-3 py-1 rounded bg-amber-50 text-amber-600 text-[10px] font-black tracking-widest uppercase mb-4 border border-amber-100/50">CONFIGURATION</div>
                    <h3 className="text-2xl md:text-3xl mb-2 text-slate-900">Shift Control</h3>
                    <p className="text-slate-500 font-medium text-xs md:text-sm">Define operational windows for each screen.</p>
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

                  <div className="flex flex-col sm:flex-row gap-3 pt-10 pb-4">
                    <button onClick={() => closeModal()} className="btn-outline-premium w-full sm:flex-1 order-2 sm:order-1">Discard</button>
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
                      className="btn-premium w-full sm:flex-[2] order-1 sm:order-2 px-4 py-4"
                    >
                      {actionLoading === 'sync-shifts' ? <Loader2 className="animate-spin" size={20} /> : (
                        <span className="whitespace-nowrap">Synchronize Shifts</span>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Availability Management Modal Content */}
              {isAvailabilityOpen && (
                <>
                  <div className="mb-8 pt-2">
                    <div className="inline-block px-3 py-1 rounded bg-brand-primary/5 text-brand-primary text-[10px] font-black tracking-widest uppercase mb-4 border border-pink-100/50">AVAILABILITY</div>
                    <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-slate-900">Booking Window</h3>
                    <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed">Control which dates are open for reservation.</p>
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

                    <div className="flex flex-col sm:flex-row gap-3 pt-8 pb-4">
                      <button onClick={() => closeModal()} className="btn-outline-premium w-full sm:flex-1 order-2 sm:order-1">Discard</button>
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
                        className="btn-premium w-full sm:flex-[2] order-1 sm:order-2 px-4 py-4"
                      >
                        {editLoading ? <Loader2 className="animate-spin" size={20} /> : (
                          <span className="whitespace-nowrap">Save Availability Settings</span>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {isPasswordModalOpen && (
                <>
                  <div className="mb-10 pt-2">
                    <div className="inline-block px-3 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-black tracking-widest uppercase mb-4 border border-slate-200">
                      Security
                    </div>
                    <h3 className="text-2xl md:text-3xl mb-2 text-slate-900">Change password</h3>
                    <p className="text-slate-500 font-medium text-xs md:text-sm">
                      Use at least 8 characters, including one letter and one number.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
                        Current password
                      </label>
                      <div className="relative">
                        <input
                          type={pwdVisible.current ? 'text' : 'password'}
                          autoComplete="current-password"
                          className="premium-input w-full pr-12"
                          value={pwdForm.currentPassword}
                          onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors"
                          aria-label={pwdVisible.current ? 'Hide password' : 'Show password'}
                          onClick={() => setPwdVisible((v) => ({ ...v, current: !v.current }))}
                        >
                          {pwdVisible.current ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
                        New password
                      </label>
                      <div className="relative">
                        <input
                          type={pwdVisible.newPwd ? 'text' : 'password'}
                          autoComplete="new-password"
                          className="premium-input w-full pr-12"
                          value={pwdForm.newPassword}
                          onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors"
                          aria-label={pwdVisible.newPwd ? 'Hide password' : 'Show password'}
                          onClick={() => setPwdVisible((v) => ({ ...v, newPwd: !v.newPwd }))}
                        >
                          {pwdVisible.newPwd ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
                        Confirm new password
                      </label>
                      <div className="relative">
                        <input
                          type={pwdVisible.confirm ? 'text' : 'password'}
                          autoComplete="new-password"
                          className="premium-input w-full pr-12"
                          value={pwdForm.confirmPassword}
                          onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors"
                          aria-label={pwdVisible.confirm ? 'Hide password' : 'Show password'}
                          onClick={() => setPwdVisible((v) => ({ ...v, confirm: !v.confirm }))}
                        >
                          {pwdVisible.confirm ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                        </button>
                      </div>
                    </div>

                    {pwdError && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                        {pwdError}
                      </div>
                    )}
                    {pwdSuccess && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        {pwdSuccess}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-2">
                      <button type="button" onClick={() => closeModal()} className="btn-outline-premium w-full sm:flex-1">
                        Close
                      </button>
                      <button
                        type="button"
                        disabled={pwdLoading}
                        onClick={async () => {
                          setPwdLoading(true);
                          setPwdError('');
                          setPwdSuccess('');
                          try {
                            const { data } = await adminService.changePassword({
                              currentPassword: pwdForm.currentPassword,
                              newPassword: pwdForm.newPassword,
                              confirmPassword: pwdForm.confirmPassword,
                            });
                            if (data.success) {
                              setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                              setPwdVisible({ current: false, newPwd: false, confirm: false });
                              setPwdSuccess(data.message || 'Password updated successfully.');
                            }
                          } catch (err) {
                            const res = err.response?.data;
                            if (res?.errors?.length) {
                              setPwdError(res.errors.map((e) => e.message).join('. '));
                            } else {
                              setPwdError(res?.message || err.message || 'Could not update password');
                            }
                          } finally {
                            setPwdLoading(false);
                          }
                        }}
                        className="btn-premium w-full sm:flex-[2] px-4 py-4"
                      >
                        {pwdLoading ? <Loader2 className="animate-spin" size={20} /> : 'Update password'}
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
