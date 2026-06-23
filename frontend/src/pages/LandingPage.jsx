import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Archive, Lock, FileText, Cpu, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-dark-bg pt-28 pb-16 px-4 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Decorative Radial Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl w-full text-center relative z-10">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full text-sm font-semibold text-primary mb-6"
        >
          <Cpu size={16} />
          <span>Tugas Besar Sistem Multimedia 2026</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight font-display text-white mb-6 leading-tight"
        >
          Amankan & Kompresi Media Anda di <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary neon-text-purple">
            PixelVault
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Platform terintegrasi untuk pengolahan kompresi data multimedia menggunakan 
          <span className="text-white font-semibold"> Huffman Coding & DCT</span>, serta penyembunyikan pesan rahasia dengan 
          <span className="text-white font-semibold"> LSB Steganografi</span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link 
            to="/compress" 
            className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 neon-glow-purple"
          >
            Mulai Kompresi
            <ArrowRight size={20} />
          </Link>
          <Link 
            to="/steganography" 
            className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all duration-300 transform hover:scale-105"
          >
            Mulai Steganografi
            <Lock size={20} />
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <div className="glass-card glass-card-hover p-8 rounded-3xl text-left">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 border border-primary/20">
              <Archive size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-display">Codec Kompresi</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Kompresi Lossless Gambar & Audio menggunakan **Huffman Coding**, serta kompresi Lossy Gambar menggunakan algoritma **DCT** dengan metrik visual **PSNR**.
            </p>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-secondary flex items-center gap-1">
                <CheckCircle size={12} /> Huffman (Lossless)
              </span>
              <span className="text-xs text-secondary flex items-center gap-1">
                <CheckCircle size={12} /> DCT (Lossy - JPEG-like)
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card glass-card-hover p-8 rounded-3xl text-left">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6 border border-secondary/20">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-display">LSB Steganografi</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Sembunyikan teks rahasia di dalam media **Gambar (PNG)**, **Audio (WAV)**, dan **Video (AVI)** tanpa merusak kualitas visual luar media penampung.
            </p>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-primary flex items-center gap-1">
                <CheckCircle size={12} /> Image, Audio & Video
              </span>
              <span className="text-xs text-primary flex items-center gap-1">
                <CheckCircle size={12} /> Lossless RGBA Extraction
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card glass-card-hover p-8 rounded-3xl text-left">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 mb-6 border border-slate-700">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-display">Laporan Akademik</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Visualisasi grafik metrik perbandingan byte, rasio kompresi, waktu pemrosesan, dan nilai PSNR disiapkan sebagai bahan lampiran laporan tugas besar.
            </p>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <CheckCircle size={12} /> Ekspor Data Metrik
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <CheckCircle size={12} /> Grafik Interaktif
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
