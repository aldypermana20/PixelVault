import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Archive, Lock, Info } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Beranda', icon: <Shield size={18} /> },
    { path: '/compress', label: 'Kompresi', icon: <Archive size={18} /> },
    { path: '/steganography', label: 'Steganografi', icon: <Lock size={18} /> },
    { path: '/about', label: 'Tentang', icon: <Info size={18} /> },
  ];

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-6xl px-4">
      <div className="glass-card flex items-center justify-between px-6 py-4 rounded-2xl">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wider font-display text-white">
          <Shield className="text-primary animate-pulse" size={26} />
          <span>
            Pixel<span className="text-secondary font-display">Vault</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-1 md:gap-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1 md:gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive(item.path)
                  ? 'bg-primary text-white neon-glow-purple'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
