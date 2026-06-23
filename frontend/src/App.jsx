import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import CompressPage from './pages/CompressPage';
import StegoPage from './pages/StegoPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-dark-bg text-slate-100 flex flex-col">
        {/* Floating Navigation Header */}
        <Navbar />
        
        {/* Content Routes */}
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/compress" element={<CompressPage />} />
            <Route path="/steganography" element={<StegoPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
