import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(navRef.current, 
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Reserve', path: '/book' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav ref={navRef} className="sticky top-0 z-50 h-[70px] md:h-[80px] flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100/50">
      <Link to="/" className="flex items-center gap-2 group z-50 shrink-0">
        <span className="text-2xl md:text-3xl font-normal text-brand-primary font-display transition-colors whitespace-nowrap">My Big Dream</span>
      </Link>
      
      {/* Desktop Navigation Links - Centered */}
      <div className="hidden lg:flex items-center gap-2">
        {navLinks.map((item) => (
          <Link 
            key={item.name}
            to={item.path} 
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
              location.pathname === item.path 
              ? 'bg-slate-100 text-slate-800' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 md:gap-3 z-50">
        {/* Call to Action */}
        <Link to="/book" className="btn-premium py-2 px-4 md:py-2.5 md:px-6 text-xs md:text-sm font-semibold shadow-pink-500/20 whitespace-nowrap">
          <span className="hidden sm:inline">Plan a Celebration</span>
          <span className="sm:hidden">Book Now</span>
        </Link>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden text-slate-800 p-1.5"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-[70px] md:top-[80px] left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-6 flex flex-col gap-3 lg:hidden rounded-b-3xl">
          {navLinks.map((item) => (
            <Link 
              key={item.name}
              to={item.path} 
              className={`px-4 py-3.5 rounded-2xl text-center text-[15px] font-bold transition-all ${
                location.pathname === item.path 
                ? 'bg-brand-primary/10 text-brand-primary' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
