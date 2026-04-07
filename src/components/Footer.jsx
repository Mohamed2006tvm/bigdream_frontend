import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-16 border-t border-slate-200 bg-slate-50/80 mt-auto relative z-10 w-full">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="col-span-1">
            <Link to="/" className="text-3xl font-normal text-brand-primary font-display block mb-4">Birthday Surprise</Link>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium">
              Create unforgettable memories with our curated birthday surprise experiences and exclusive hidden venues.
            </p>
          </div>
          
          <div>
            <h4 className="font-normal text-slate-800 text-xl font-display mb-6">Quick Links</h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-slate-500 hover:text-brand-primary text-sm font-medium transition-colors">Home</Link>
              <Link to="/about" className="text-slate-500 hover:text-brand-primary text-sm font-medium transition-colors">About</Link>
              <Link to="/book" className="text-slate-500 hover:text-brand-primary text-sm font-medium transition-colors">Reserve</Link>
              <Link to="/contact" className="text-slate-500 hover:text-brand-primary text-sm font-medium transition-colors">Contact</Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-normal text-slate-800 text-xl font-display mb-6">Contact</h4>
            <div className="flex flex-col gap-3">
              <span className="text-slate-500 text-sm font-medium">+91 XXXXX XXXXX</span>
              <span className="text-slate-500 text-sm font-medium">info@eventhall.com</span>
              <span className="text-slate-500 text-sm font-medium">Your City</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-200/60 pt-8 text-center flex items-center justify-center">
          <p className="text-slate-400 text-[11px] font-medium tracking-wide">© 2026 Birthday Surprise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
