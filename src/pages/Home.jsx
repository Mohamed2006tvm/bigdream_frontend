import React, { useState } from 'react';
import { 
  Monitor, 
  Clock, 
  CheckCircle, 
  Zap, 
  Shield, 
  Star, 
  ChevronDown, 
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Layers,
  Sparkles,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
// Using images from public/assests/Screens/
const Screen1_1 = "/assests/Screens/Screen1.1.jpeg";
const Screen1_2 = "/assests/Screens/Screen1.2.jpeg";
const Screen1_3 = "/assests/Screens/Screen1.3.jpeg";
const Screen1_4 = "/assests/Screens/Screen1.4.jpeg";

const Screen2_1 = "/assests/Screens/Screen2.1.jpeg";
const Screen2_2 = "/assests/Screens/Screen2.2.jpeg";
const Screen2_3 = "/assests/Screens/Screen2.3.jpeg";
const Screen2_4 = "/assests/Screens/Screen2.4.jpeg";

const Screen3_1 = "/assests/Screens/Screen3.1.jpeg";
const Screen3_2 = "/assests/Screens/Screen3.2.jpeg";
const Screen3_3 = "/assests/Screens/Screen3.3.jpeg";
const Screen3_4 = "/assests/Screens/Screen3.4.jpeg";

const Home = () => {
  const [activeFaq, setActiveFaq] = useState(null);


  return (
    <div className="min-h-screen bg-bg-main font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-bg-main">
        {/* Dynamic Floating Background Orbs */}
        <motion.div 
          animate={{ y: [0, -30, 0], x: [0, 20, 0], scale: [1, 1.05, 1], rotate: [0, 10, 0] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform, opacity" }}
          className="absolute top-[10%] left-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-pink-400/10 rounded-full filter blur-[60px] md:blur-[90px] opacity-70 pointer-events-none -z-10" 
        />
        <motion.div 
          animate={{ y: [0, 40, 0], x: [0, -30, 0], scale: [1, 1.1, 1], rotate: [0, -10, 0] }} 
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ willChange: "transform, opacity" }}
          className="absolute top-[20%] right-[10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple-400/10 rounded-full filter blur-[80px] md:blur-[110px] opacity-70 pointer-events-none -z-10" 
        />

        {/* Floating Balloons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-12 h-16 rounded-full bg-brand-primary/20 backdrop-blur-sm border border-brand-primary/30 animate-float-balloon"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 1.5}s`,
                width: `${30 + Math.random() * 30}px`,
                height: `${40 + Math.random() * 40}px`,
                backgroundColor: i % 2 === 0 ? 'rgba(236, 72, 153, 0.2)' : 'rgba(139, 92, 246, 0.2)',
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-pink-100 shadow-[0_4px_20px_-4px_rgba(236,72,153,0.1)] text-slate-600 text-[11px] font-semibold tracking-wide mb-8"
              >
                <Sparkles size={14} className="text-brand-primary" strokeWidth={2} /> Smart Booking Engine v2.0
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="text-6xl md:text-7xl lg:text-[5rem] font-normal mb-8 tracking-tighter leading-[1.1] text-slate-800 drop-shadow-[0_10px_10px_rgba(0,0,0,0.02)]"
              >
                Magical Birthday <br />
                Celebrations <br />
                <span className="text-slate-800">Made Easy</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-lg md:text-xl text-slate-500 max-w-xl mb-10 leading-relaxed font-medium opacity-80"
              >
                Plan the perfect celebration with our hidden venue, curated themes, and seamless booking experience. Create memories that last a lifetime.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5, type: "spring", bounce: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-start"
              >
                <Link to="/book" className="btn-premium px-8 py-4 text-sm font-semibold rounded-full flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 hover:-translate-y-1 transition-all group">
                  Plan a Celebration <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="px-8 py-4 text-sm font-semibold bg-white text-slate-800 rounded-full flex items-center justify-center shadow-lg shadow-slate-200/50 hover:bg-slate-50 hover:-translate-y-1 transition-all">
                  View Virtual Tour
                </Link>
              </motion.div>
            </div>

            {/* Right Images (Unique Attractive Feature) */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="relative hidden lg:block h-[500px] xl:h-[600px] w-full"
            >
              <div className="absolute top-0 right-0 w-[85%] h-[80%] rounded-[32px] overflow-hidden shadow-2xl shadow-pink-500/10 border-[8px] border-white z-10 transition-transform duration-500 hover:scale-[1.02]">
                <img src={Screen1_1} alt="Birthday Celebration Showcase" className="w-full h-full object-cover" />
              </div>
              
              <div className="absolute bottom-4 left-0 w-[55%] h-[45%] rounded-[32px] overflow-hidden shadow-2xl shadow-purple-500/15 border-[8px] border-white z-20 transition-transform duration-500 hover:-translate-y-4">
                <img src={Screen2_1} alt="Birthday Celebration Venue" className="w-full h-full object-cover" />
              </div>
              
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 -left-6 bg-white px-5 py-3 rounded-2xl shadow-xl border border-slate-50 z-30"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs font-black tracking-wide text-slate-800 uppercase">Available Now</span>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl font-normal text-slate-800 tracking-tight">Trusted by <span className="text-gradient-premium">Hundreds of Families</span></h2>
          <p className="text-slate-400 mt-4 text-[10px] font-black tracking-[0.3em] uppercase">Celebrations that sparkle</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Celebrations Organized', value: '500+', icon: <Sparkles size={24} className="text-brand-primary" /> },
            { label: 'Themed Experiences', value: '12', icon: <Monitor size={24} className="text-brand-primary" /> },
            { label: 'Happy Families', value: '1000+', icon: <Users size={24} className="text-brand-primary" /> },
            { label: 'Celebration Concierge', value: '24/7', icon: <Phone size={24} className="text-brand-primary" /> }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-10 rounded-[32px] flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-pink-500/5 border border-pink-50/50">
              <div className="mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
              <div className="text-5xl font-black text-brand-primary mb-2 tracking-tighter drop-shadow-sm">{stat.value}</div>
              <div className="text-xs font-medium text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Availability Preview */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-normal text-slate-900 tracking-tight leading-tight"><span className="text-gradient-premium">Live</span> Availability</h2>
            <p className="text-slate-500 mt-4 text-lg font-medium">See real-time slot availability before booking</p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white rounded-[32px] p-10 md:p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 text-center">
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Available
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> Booked
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <div className="w-3 h-3 rounded-full bg-[#eab308]"></div> Cleaning
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="py-6 px-4 rounded-2xl bg-[#10b981] text-white transition-transform hover:-translate-y-1">
                <div className="text-xs font-medium mb-1.5 opacity-90">09:00 - 12:00</div>
                <div className="text-lg font-semibold">Available</div>
              </div>
              <div className="py-6 px-4 rounded-2xl bg-[#ef4444] text-white transition-transform hover:-translate-y-1">
                <div className="text-xs font-medium mb-1.5 opacity-90">12:00 - 15:00</div>
                <div className="text-lg font-semibold">Booked</div>
              </div>
              <div className="py-6 px-4 rounded-2xl bg-[#eab308] text-white transition-transform hover:-translate-y-1">
                <div className="text-xs font-medium mb-1.5 opacity-90">15:00 - 18:00</div>
                <div className="text-lg font-semibold">Cleaning</div>
              </div>
              <div className="py-6 px-4 rounded-2xl bg-[#10b981] text-white transition-transform hover:-translate-y-1">
                <div className="text-xs font-medium mb-1.5 opacity-90">18:00 - 21:00</div>
                <div className="text-lg font-semibold">Available</div>
              </div>
            </div>

            <div className="flex justify-center">
              <Link to="/book" className="btn-premium rounded-full flex items-center gap-3 py-3 px-8 text-sm">
                View All Slots <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-normal text-slate-900 tracking-tight">How It <span className="text-gradient-premium">Works</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-16 relative z-10">
          <div className="absolute top-[40px] left-[16.66%] w-[66.66%] h-[2px] bg-slate-200 -z-10 hidden md:block"></div>
          {[
            { step: 1, title: 'Pick a Theme', desc: 'Select from our magic forest, royal palace, or space quest themes', icon: <Sparkles size={32} strokeWidth={1.5} /> },
            { step: 2, title: 'Set the Timing', desc: 'Choose the perfect arrival time for the ultimate shock factor', icon: <Clock size={32} strokeWidth={1.5} /> },
            { step: 3, title: 'Let Magic Happen', desc: 'We handle the decor, cake, and reveal—you bring the guest of honor', icon: <Star size={32} strokeWidth={1.5} /> }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center mb-6 shadow-xl shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <div className="text-brand-primary text-xs font-black uppercase tracking-widest mb-3">STEP {item.step}</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">{item.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      

      {/* Why Choose */}
      <section className="py-24 container mx-auto px-6" id="about">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-normal text-slate-900 tracking-tight">Why Choose <span className="text-gradient-premium">My dream surprise</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Full Secrecy', desc: 'Hidden entrance and soundproofed walls for the perfect reveal', icon: <Shield size={24} strokeWidth={1.5} /> },
            { title: 'Themed Decor', desc: 'Professional designers create an immersive world for your special day', icon: <Zap size={24} strokeWidth={1.5} /> },
            { title: 'Party Support', desc: 'Our team acts as co-conspirators to ensure every detail is flawless', icon: <Users size={24} strokeWidth={1.5} /> }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] hover:-translate-y-2 transition-transform duration-300 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
              <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center mb-6 shadow-md shadow-pink-500/20">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[90%]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Screens */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-normal text-slate-900 tracking-tight">Venue <span className="text-gradient-premium">Themes</span></h2>
            <p className="text-slate-500 mt-4 text-base font-medium">Choose a magical world for your birthday celebration</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Magic Forest', img: Screen1_1, desc: 'Immersive nature theme with fairy lights and fog effects', features: ['Bio-luminescent Decor', 'Surround Sound', 'Hidden Entrance'] },
              { name: 'Royal Palace', img: Screen2_1, desc: 'Elegant theme with grand chandeliers and red carpet', features: ['Luxury Catering', 'Throne Chair', 'Professional Photography'] },
              { name: 'Milky Moon', img: Screen3_1, desc: 'Neon cosmic theme with dry ice and laser lights', features: ['Laser Show', 'Futuristic Music', 'Intergalactic Decor'] }
            ].map((screen, i) => (
              <div key={i} className="bg-white overflow-hidden rounded-[32px] hover:-translate-y-2 transition-transform duration-300 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] group">
                <div className="h-48 overflow-hidden relative">
                  <img src={screen.img} alt={screen.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg">
                    <Monitor size={20} strokeWidth={1.5} />
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{screen.name}</h3>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">{screen.desc}</p>
                  <div className="flex flex-col gap-3">
                    {screen.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <div className="text-brand-primary/80">
                          <CheckCircle size={16} strokeWidth={2} />
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 container mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-normal text-slate-900 tracking-tight">What Our <span className="text-gradient-premium">Clients Say</span></h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="glass-card-premium p-8 md:p-16 text-center relative overflow-hidden rounded-[40px]">
            <div className="absolute top-4 left-4 md:top-10 md:left-10 text-brand-primary/5 -z-0">
              <Star className="w-[100px] h-[100px] md:w-[160px] md:h-[160px]" fill="currentColor" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-center gap-1.5 mb-6 md:mb-8 text-brand-primary">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} className="md:w-6 md:h-6" fill="currentColor" />)}
              </div>
              <p className="text-xl md:text-3xl font-medium text-slate-700 mb-8 md:mb-10 italic leading-relaxed">
                "Loved the smooth booking and quick confirmation. The screens were top-notch!"
              </p>
              <div className="text-brand-primary font-black uppercase tracking-[0.2em] text-xs md:text-base">Arun Kumar</div>
              <div className="flex justify-center gap-3 mt-8 md:mt-12">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-slate-200"></div>
                <div className="w-8 h-2.5 md:w-10 md:h-3 rounded-full bg-brand-primary shadow-lg shadow-pink-500/20"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-slate-200"></div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Ready to Book */}
      <section className="py-32 container mx-auto px-6">
        <div className="bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary rounded-[40px] md:rounded-[60px] p-10 md:p-20 text-center text-white shadow-3xl shadow-pink-500/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 md:p-20 text-white/10 group-hover:rotate-12 transition-transform duration-700">
            <Calendar className="w-[150px] h-[150px] md:w-[400px] md:h-[400px] opacity-30 md:opacity-100" strokeWidth={1} />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-normal mb-6 md:mb-8 tracking-tighter leading-tight">Ready to Book Your Slot?</h2>
            <p className="text-white/90 text-lg md:text-xl font-medium mb-10 md:mb-16 leading-relaxed">Reserve your preferred screen in seconds with our automated booking engine.</p>
            <Link to="/book" className="bg-white text-brand-primary px-8 py-4 md:px-14 md:py-6 rounded-2xl md:rounded-[24px] font-black tracking-widest text-sm md:text-base uppercase hover:scale-105 hover:shadow-2xl transition-all flex items-center justify-center gap-3 mx-auto w-fit">
              Reserve Now <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 container mx-auto px-6 bg-white" id="contact">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-normal text-slate-900 tracking-tight">Frequently Asked <span className="text-gradient-premium">Questions</span></h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            { q: 'How do I book a slot?', a: 'Choose your desired screen and time slot, enter your details, and confirm. It is that simple! Our system will instantly lock your reservation.' },
            { q: 'Are slots updated in real-time?', a: 'Absolutely! Our system ensures that availability is always up to date across all screens, preventing any double-bookings.' }
          ].map((faq, i) => (
            <div key={i} className="glass-card-premium overflow-hidden border border-pink-100/30">
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-8 flex justify-between items-center text-left hover:bg-pink-50/30 transition-colors"
              >
                <span className="text-xl font-bold text-slate-800">{faq.q}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeFaq === i ? 'bg-brand-primary text-white rotate-180' : 'bg-pink-50 text-brand-primary'}`}>
                  <ChevronDown size={20} />
                </div>
              </button>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-8 pb-8 text-slate-500 text-lg leading-relaxed font-medium"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
