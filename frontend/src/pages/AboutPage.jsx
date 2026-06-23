import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Shield, Code, Layers, FileText } from 'lucide-react';

const AboutPage = () => {
  const team = [
    { name: 'Aldy', role: 'Perancang Sistem', avatar: 'AS', desc: 'Merancang arsitektur sistem dan menyiapkan materi data uji media.' },
    { name: 'Dapoy', role: 'Pengembang Web', avatar: 'DP', desc: 'Implementasi kode backend FastAPI, routing API, dan visualisasi UI frontend.' },
    { name: 'Dwi', role: 'Penyusun Laporan', avatar: 'DW', desc: 'Menyusun laporan akademik tugas besar berdasarkan template Kerja Praktek.' }
  ];

  return (
    <div className="relative min-h-screen bg-dark-bg pt-28 pb-16 px-4">
      {/* Background radial glows */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold font-display text-white mb-4">
            Tentang <span className="text-primary neon-text-purple">PixelVault</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-md max-w-xl mx-auto">
            Proyek ini dikembangkan untuk memenuhi penilaian Tugas Besar UAS mata kuliah **Sistem Multimedia** semester genap.
          </p>
        </div>

        {/* Algorithms Information Section */}
        <div className="flex flex-col gap-8 mb-16">
          <h3 className="text-2xl font-bold font-display text-white border-b border-dark-border pb-3 flex items-center gap-2">
            <BookOpen size={22} className="text-secondary" />
            Landasan Teori Algoritma
          </h3>
          
          {/* Huffman Card */}
          <div className="glass-card p-6 rounded-3xl grid md:grid-cols-4 gap-6 items-start">
            <div className="md:col-span-1 bg-primary/10 border border-primary/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <Layers className="text-primary mb-3" size={32} />
              <h4 className="text-md font-bold text-white font-display">Huffman Coding</h4>
              <span className="text-[10px] text-secondary font-bold mt-1">Lossless Codec</span>
            </div>
            <div className="md:col-span-3">
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                Huffman Coding adalah algoritma kompresi lossless yang menggunakan representasi biner dengan panjang bervariasi (*variable-length code*). Algoritma ini menghitung frekuensi kemunculan setiap byte data piksel atau sampel audio.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Byte yang paling sering muncul diberi kode biner yang lebih pendek, sedangkan byte yang jarang muncul diberi kode lebih panjang. Kode dibentuk menggunakan **Pohon Huffman (Huffman Tree)** biner. File `.huff` hasil kompresi kami menyematkan peta tabel frekuensi (*codebook*) agar file dapat direkonstruksi 100% identik tanpa kehilangan data sedikit pun (*bit-perfect*).
              </p>
            </div>
          </div>

          {/* DCT Card */}
          <div className="glass-card p-6 rounded-3xl grid md:grid-cols-4 gap-6 items-start">
            <div className="md:col-span-1 bg-secondary/10 border border-secondary/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <Code className="text-secondary mb-3" size={32} />
              <h4 className="text-md font-bold text-white font-display">DCT (Cosine)</h4>
              <span className="text-[10px] text-primary font-bold mt-1">Lossy Codec</span>
            </div>
            <div className="md:col-span-3">
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                **Discrete Cosine Transform (DCT)** memindahkan representasi spasial (nilai piksel) ke representasi domain frekuensi. Komponen frekuensi tinggi yang kurang sensitif bagi mata manusia dikurangi kepadatannya menggunakan matriks kuantisasi standar.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Blok gambar berukuran 8x8 dipetakan menjadi koefisien frekuensi DCT. Setelah kuantisasi, kami mengurutkan koefisien menggunakan **Zigzag Scan** untuk mengelompokkan nilai nol, kemudian mengompresinya secara efisien dengan **Run-Length Encoding (RLE)**. Metrik kualitas hasil rekonstruksi diukur menggunakan **PSNR (Peak Signal-to-Noise Ratio)**.
              </p>
            </div>
          </div>

          {/* LSB Card */}
          <div className="glass-card p-6 rounded-3xl grid md:grid-cols-4 gap-6 items-start">
            <div className="md:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <Shield className="text-slate-300 mb-3" size={32} />
              <h4 className="text-md font-bold text-white font-display">LSB Steganography</h4>
              <span className="text-[10px] text-slate-500 font-bold mt-1">Penyembunyian Data</span>
            </div>
            <div className="md:col-span-3">
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                **Least Significant Bit (LSB) Steganography** menyembunyikan bit pesan biner pada posisi bit terendah (paling kanan) dari data pixel gambar atau amplitudo sampel audio.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Karena perubahan bit LSB hanya menaikkan atau menurunkan nilai warna/audio sebesar 1 tingkat, perubahan ini secara fisik tidak dapat dikenali oleh panca indra manusia. Kami mendesain encoder LSB untuk Gambar (PNG), Audio (WAV), dan Video (AVI frame). Data diakhiri oleh penanda khusus `###END###` dan wajib disimpan lossless agar bit-bit tersebut tidak rusak oleh kompresi eksternal.
              </p>
            </div>
          </div>
        </div>

        {/* Team Profile Section */}
        <div className="flex flex-col gap-8">
          <h3 className="text-2xl font-bold font-display text-white border-b border-dark-border pb-3 flex items-center gap-2">
            <FileText size={22} className="text-primary" />
            Anggota Kelompok Tim
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.name} className="glass-card p-6 rounded-3xl text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-display text-xl font-bold text-white mb-4 neon-glow-purple">
                  {member.avatar}
                </div>
                <h4 className="text-lg font-bold text-white font-display mb-1">{member.name}</h4>
                <span className="text-xs text-primary font-semibold mb-4">{member.role}</span>
                <p className="text-slate-400 text-xs leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
