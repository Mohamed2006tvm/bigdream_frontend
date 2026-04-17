import React, { useState, useEffect, useRef } from 'react';
import { format, addDays } from 'date-fns';
import { Loader2, Plus, Users, Clock, AlertCircle, X, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { bookingService } from '../services/api';
import { formatTimeSlot } from '../utils/formatters';
import gsap from 'gsap';

const Availability = () => {
  const [authDates, setAuthDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', customTime: '' });
  const [bookingStatus, setBookingStatus] = useState({ type: null, message: '' });

  const contentRef = useRef(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    fetchDates();
  }, []);

  const fetchDates = async () => {
    setDatesLoading(true);
    try {
      const { data } = await bookingService.getAuthorizedDates();
      if (data.data && data.data.length > 0) {
        setAuthDates(data.data);
        setSelectedDate(data.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch authorized dates', err);
    } finally {
      setDatesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability();
    }
  }, [selectedDate]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const { data } = await bookingService.getAvailability(selectedDate);
      setAvailability(data.data.availability);
      setBookingStatus({ type: null, message: '' });
    } catch (err) {
      setBookingStatus({ type: 'error', message: 'Failed to load availability.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && availability.length > 0 && contentRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(contentRef.current, { opacity: 1, duration: 0.1 });
        gsap.fromTo(contentRef.current.children,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        );
      }, contentRef);
      return () => ctx.revert();
    }
  }, [loading, availability]);

  useEffect(() => {
    if (selectedSlot) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(modalRef.current,
        { scale: 0.9, y: 20, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [selectedSlot]);

  const closeModal = () => {
    gsap.to(modalRef.current, { scale: 0.95, opacity: 0, duration: 0.2, onComplete: () => setSelectedSlot(null) });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingStatus({ type: 'loading', message: 'Processing your booking...' });
    try {
      await bookingService.createBooking({
        screen_name: selectedSlot.screenName,
        date: selectedDate,
        time_slot: selectedSlot.isCustom ? bookingForm.customTime : selectedSlot.timeSlot,
        customer_name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone
      });
      setBookingStatus({ type: 'success', message: 'Booking confirmed! Check your email.' });
      setTimeout(() => {
        fetchAvailability();
        closeModal();
        setBookingForm({ name: '', email: '', phone: '', customTime: '' });
      }, 2000);
    } catch (err) {
      setBookingStatus({ type: 'error', message: err.response?.data?.message || 'Booking failed.' });
    }
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        <header className="mb-12">
          <h2 className="text-4xl md:text-5xl mb-4 font-normal font-display">
            The <span className="text-gradient-premium">Dream Calendar</span>
          </h2>
          <p className="text-slate-500 font-medium">Pick the perfect moment for your ultimate celebration.</p>
        </header>

        {/* Date Selector */}
        <div className="flex gap-4 overflow-x-auto pb-6 mb-12 scrollbar-none">
          {datesLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex-none min-w-[120px] h-24 rounded-2xl bg-white border border-pink-100/50 animate-pulse" />
            ))
          ) : authDates.length === 0 ? (
            <p className="text-slate-400 font-medium italic">No booking dates currently available.</p>
          ) : (
            authDates.map((ds) => {
              const d = new Date(ds);
              const isActive = selectedDate === ds;
              return (
                <button
                  key={ds}
                  onClick={() => setSelectedDate(ds)}
                  className={`flex-none min-w-[120px] p-4 rounded-2xl border transition-all duration-300 ${isActive
                      ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-pink-500/30'
                      : 'bg-white border-pink-100/50 text-slate-500 hover:bg-pink-50'
                    }`}
                >
                  <div className="text-xs uppercase tracking-widest opacity-60 mb-1">{format(d, 'EEE')}</div>
                  <div className="text-lg font-bold font-display">{format(d, 'dd MMM')}</div>
                </button>
              );
            })
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-brand-primary" size={48} />
            <p className="text-slate-500 animate-pulse font-medium">Fetching real-time slots...</p>
          </div>
        ) : (
          <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-0">
            {availability.length === 0 ? (
              <div className="col-span-full py-20 text-center animate-fade-in">
                <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100/50 inline-block mb-6">
                  <AlertCircle className="text-amber-500" size={48} />
                </div>
                <h3 className="text-2xl font-display mb-2">The Magic is Resting</h3>
                <p className="text-slate-500 max-w-md mx-auto">Our celebration halls are currently undergoing a festive transformation. Check back soon!</p>
              </div>
            ) : availability.map((screen) => (
              <div key={screen.screen_id} className="glass-card-premium p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
                      <Users size={20} />
                    </div>
                    <h3 className="text-xl font-normal font-display">
                      {screen.screen_name === 'A' ? 'Magic Forest' :
                        screen.screen_name === 'B' ? 'Royal Palace' :
                          screen.screen_name === 'C' ? 'Milky Moon' :
                            `Screen ${screen.screen_name}`}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-pink-50 border border-pink-100 text-brand-primary/70">
                    4K HDR
                  </span>
                </div>               
                <div className="space-y-3 flex-grow">
                  {screen.time_slots.map((slot) => {
                    const booking = screen.slots.find(s => s.time_slot === slot);
                    const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
                    const currentTime = format(new Date(), 'HH:mm');
                    const slotStart = slot.split('-')[0];
                    const isPast = isToday && slotStart < currentTime;

                    const isOccupied = !!booking || booking?.status === 'cleaning' || booking?.status === 'maintenance' || isPast;
                    const status = isPast ? 'past' : (booking?.status || 'available');

                    return (
                      <button
                        key={slot}
                        disabled={isOccupied}
                        onClick={() => setSelectedSlot({ screenId: screen.screen_id, screenName: screen.screen_name, timeSlot: slot, isCustom: false })}
                        className={`w-full group px-4 py-4 rounded-xl border flex items-center justify-between transition-all ${isOccupied
                            ? 'bg-slate-50 border-slate-100 opacity-60 grayscale cursor-not-allowed'
                            : 'bg-white border-pink-100/50 hover:border-brand-primary/50 hover:bg-pink-50/50 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock size={16} className={isOccupied ? 'text-slate-400' : 'text-brand-accent'} />
                          <span className={`font-mono font-bold ${isOccupied ? 'text-slate-400' : 'text-slate-700'}`}>
                            {formatTimeSlot(slot)}
                          </span>
                        </div>
                        {isOccupied ? (
                          <span className="text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded bg-slate-200 text-slate-500 font-bold">
                            {status}
                          </span>
                        ) : (
                          <Plus size={16} className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setSelectedSlot({ screenId: screen.screen_id, screenName: screen.screen_name, timeSlot: '', isCustom: true })}
                    className="w-full mt-4 py-4 rounded-xl border-2 border-dashed border-pink-100 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-brand-primary/50 hover:text-brand-primary transition-all bg-slate-50/50 group"
                  >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform text-brand-primary" />
                    Request Custom Time
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Premium Seating</span>
                    <span className="text-brand-primary font-bold">Available</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {selectedSlot && (
          <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-pink-900/40 backdrop-blur-md opacity-0"
            onClick={closeModal}
          >
            <div
              ref={modalRef}
              className="glass-card-premium w-full max-w-lg p-8 relative isolate overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-pink-50 transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-10">
                <div className="inline-block px-3 py-1 rounded bg-brand-primary/20 text-brand-primary text-xs font-bold mb-4">RESERVATION</div>
                <h3 className="text-3xl mb-2 text-slate-900">Secure your Dream</h3>
                <p className="text-slate-500 flex items-center gap-2 font-medium">
                  {selectedSlot.screenName === 'A' ? 'Magic Forest' :
                    selectedSlot.screenName === 'B' ? 'Royal Palace' :
                      selectedSlot.screenName === 'C' ? 'Milky Moon' :
                        `Screen ${selectedSlot.screenName}`} <ChevronRight size={14} />
                  <span className="text-brand-primary font-bold">
                    {selectedSlot.isCustom ? 'Custom Window' : formatTimeSlot(selectedSlot.timeSlot)}
                  </span>
                </p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="space-y-4">
                  {selectedSlot.isCustom && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Requested Time Slot</label>
                      <input
                        required
                        className="premium-input font-mono uppercase"
                        placeholder="e.g. 14:00-16:00"
                        value={bookingForm.customTime}
                        onChange={e => setBookingForm({ ...bookingForm, customTime: e.target.value })}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                    <input
                      required
                      className="premium-input"
                      placeholder="John Doe"
                      value={bookingForm.name}
                      onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                    <input
                      required
                      type="email"
                      className="premium-input"
                      placeholder="john@example.com"
                      value={bookingForm.email}
                      onChange={e => setBookingForm({ ...bookingForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input
                      required
                      className="premium-input"
                      placeholder="+1234567890"
                      value={bookingForm.phone}
                      onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                {bookingStatus.message && (
                  <div className={`p-4 rounded-xl flex items-start gap-3 text-sm leading-relaxed ${bookingStatus.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{bookingStatus.message}</span>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="btn-outline-premium flex-1">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingStatus.type === 'loading' || bookingStatus.type === 'success'}
                    className="btn-premium flex-[2] relative overflow-hidden"
                  >
                    {bookingStatus.type === 'loading' ? (
                      <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Confirming...</span>
                    ) : (
                      'Confirm Reservation'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Availability;
