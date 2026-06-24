import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-surface border-r border-outline-variant flex flex-col py-8 z-50">
      <div className="px-6 mb-10">
        <h1 className="font-title-md text-title-md font-bold text-on-surface">PixelVault</h1>
        <p className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold mt-1">Technical Suite</p>
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        <NavLink 
          to="/codec/image"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${window.location.pathname.startsWith('/codec') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
        >
          <span className="material-symbols-outlined">settings_input_component</span>
          <span className="font-medium">Codec</span>
        </NavLink>
        
        <NavLink 
          to="/stego/image"
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${window.location.pathname.startsWith('/stego') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
        >
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>enhanced_encryption</span>
          <span className="font-medium">Steganography</span>
        </NavLink>
      </nav>
      
      <div className="px-3 mt-auto pt-8 border-t border-outline-variant">
        <button className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-2.5 rounded-lg font-semibold text-sm mb-6 active:scale-[0.98] transition-transform">
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Project
        </button>
        <a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface text-sm" href="#">
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
          <span>Help Center</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface text-sm" href="#">
          <span className="material-symbols-outlined text-[20px]">description</span>
          <span>Documentation</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
