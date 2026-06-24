import React from 'react';
import Sidebar from './Sidebar';
import Onboarding from '../ui/Onboarding';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex">
      <Sidebar />
      <Onboarding />
      
      {/* TopNavBar */}
      <header className="fixed top-0 right-0 h-[64px] w-[calc(100%-240px)] bg-surface border-b border-outline-variant flex justify-between items-center px-8 z-40">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
            <input 
              className="pl-10 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-full text-sm w-[320px] focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all group-hover:w-80" 
              placeholder="Search experiments..." 
              type="text"
            />
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-sm">
            <a className="text-on-surface-variant hover:text-primary transition-opacity" href="#">Projects</a>
            <a className="text-on-surface-variant hover:text-primary transition-opacity" href="#">Archive</a>
            <a className="text-on-surface-variant hover:text-primary transition-opacity" href="#">Team</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined">history</span>
          </button>
          <div className="h-6 w-[1px] bg-outline-variant mx-2"></div>
          <button className="px-4 py-1.5 text-sm font-semibold border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">Export</button>
          <button className="px-4 py-1.5 text-sm font-semibold bg-primary text-on-primary rounded-lg active:opacity-80 transition-opacity">Deploy</button>
          <div className="w-8 h-8 rounded-full border border-outline-variant ml-2 overflow-hidden bg-surface-container-highest">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJTVQheH_LsQdY-mJS9XlYO9LiaWlEyZXykjMhrdBA_r6NH1iUHGxj0MHmlzR9lRpYRBjvD51HYBHD0Wcvawcjcu1Fr_aJsCaKRDb8yMM5wg3sDvJ7QERRVcdelob2SeSeNL4Slj3vQxwwqWxr-yZHFKeuG1ZafEr8U5cn6P3ODxt8Sc-iz8_OJu7nBFPtICEwSOCi_94bF5HNiz2HUJjL5y4HWjKzI0G7U2lq02yYaZhz5Lt6X1OUQ6ueh6Sd6Gi80EIQjLVI72KJ" 
              alt="Profile"
            />
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="ml-[240px] mt-[64px] p-8 w-[calc(100%-240px)] min-h-[calc(100vh-64px)]">
        <div className="max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
