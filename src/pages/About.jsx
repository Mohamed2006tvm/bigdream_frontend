import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Monitor, Building2, Calendar, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Using images from public/assests/Screens/
const Screen1_2 = "/assests/Screens/Screen1.2.jpeg";
const Screen2_2 = "/assests/Screens/Screen2.2.jpeg";
const Screen3_2 = "/assests/Screens/Screen3.2.jpeg";
const Screen1_3 = "/assests/Screens/Screen1.3.jpeg";
const Screen2_3 = "/assests/Screens/Screen2.3.jpeg";
const Screen3_3 = "/assests/Screens/Screen3.3.jpeg";

const About = () => {
  const [currentImg, setCurrentImg] = useState(0);
  const images = [Screen1_2, Screen2_2, Screen3_2, Screen1_3, Screen2_3, Screen3_3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const nextImg = () => setCurrentImg((prev) => (prev + 1) % images.length);
  const prevImg = () => setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
  return (
    <div className="min-h-screen bg-bg-main ">
      <Navbar />
      
      <div className="container mx-auto px-6 py-24 animate-fade-in">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-normal mb-6 tracking-tighter text-gradient-premium drop-shadow-[0_10px_10px_rgba(0,0,0,0.02)]">The Magic Behind Birthdays</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">Dedicated to creating heart-pounding surprise moments and unforgettable birthday memories</p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto mb-20">
          <div>
            <h2 className="text-3xl md:text-4xl font-normal text-slate-800 mb-8 tracking-tight">Crafting the Perfect <span className="text-gradient-premium">Birthday Surprise</span></h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-6">
              Our venue features magically themed immersive worlds with professional decor, high-end sound systems, and a dedicated surprise management team. Every detail is crafted to ensure your surprise is a flawless success.
            </p>
            <p className="text-slate-500 font-medium leading-relaxed">
              Whether it's a 1st birthday, a sweet sixteen, or a milestone 50th, our versatile themes adapt to your vision with magical decor and a team of surprise experts.
            </p>
          </div>
          
          <div className="relative rounded-[32px] w-full aspect-[4/3] border-[6px] border-white shadow-2xl shadow-pink-500/15 overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImg}
                src={images[currentImg]}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full object-cover"
                alt="Birthday Surprise Showcase"
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none"></div>

            <button 
              onClick={prevImg}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-slate-800"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextImg}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-slate-800"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentImg(i)}
                  className={`h-1.5 rounded-full transition-all ${currentImg === i ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { icon: <Monitor size={24} />, text: '3 Premium Screens' },
            { icon: <Building2 size={24} />, text: 'Modern Infrastructure' },
            { icon: <Calendar size={24} />, text: 'Flexible Booking Slots' },
            { icon: <Briefcase size={24} />, text: 'Professional Environment' }
          ].map((item, i) => (
            <div key={i} className="glass-card-premium p-10 rounded-[32px] flex flex-col items-center justify-center text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="font-bold text-slate-800 text-sm leading-tight">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
