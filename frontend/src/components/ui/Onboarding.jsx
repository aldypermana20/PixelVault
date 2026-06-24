import React, { useState } from 'react';

const steps = [
  {
    title: "Selamat Datang di PixelVault",
    content: "PixelVault adalah platform profesional untuk pemrosesan dan enkripsi multimedia. Mari pelajari cara menggunakan algoritma kompresi dan steganografi tingkat akademik kami dengan mudah.",
    icon: "rocket_launch",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Kompresi & Dekompresi",
    content: "Unggah media mentah (seperti BMP/WAV) untuk memadatkannya tanpa kehilangan kualitas. Gunakan 'Decompress Mode' untuk mengembalikan file biner .huff Anda ke bentuk aslinya dengan sempurna.",
    icon: "settings_input_component",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Steganografi Tingkat Lanjut",
    content: "Sembunyikan pesan rahasia di dalam media Anda tanpa terlihat oleh mata telanjang! Gunakan 'Embed Mode' untuk menyisipkan teks, dan 'Extract Mode' untuk mengekstraknya kembali.",
    icon: "enhanced_encryption",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Aturan & Format Media",
    content: "Agar algoritma bekerja persis sesuai teori akademik, kami hanya menerima format mentah/lossless. Format seperti JPG diblokir karena kompresi lossy bawaannya akan menghancurkan data LSB Anda.",
    icon: "rule",
    image: "https://images.unsplash.com/photo-1614064641913-6b71a30624da?q=80&w=800&auto=format&fit=crop"
  }
];

const Onboarding = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) {
    return (
      <button 
        onClick={() => {
          setCurrentStep(0);
          setIsOpen(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50 group"
        title="Bantuan & Panduan"
      >
        <span className="material-symbols-outlined text-[28px]">help</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-surface w-[500px] rounded-2xl shadow-2xl border border-outline-variant overflow-hidden flex flex-col"
        style={{ animation: '0.3s cubic-bezier(0.2, 0.8, 0.2, 1) 0s 1 normal none running zoomIn' }}
      >
        <style>{`
          @keyframes zoomIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
        
        {/* Image Header */}
        <div className="relative h-56 w-full bg-surface-container-low">
          <img 
            key={currentStep} // forces re-render of image for transition if wanted, but native transition works too
            src={steps[currentStep].image} 
            alt="Onboarding Illustration" 
            className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 bg-surface shadow-md rounded-full flex items-center justify-center border-4 border-surface">
            <span className="material-symbols-outlined text-[28px] text-primary">{steps[currentStep].icon}</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="p-8 pt-10 flex flex-col items-center text-center">
          <h2 className="font-display-lg-mobile text-on-surface mb-3">{steps[currentStep].title}</h2>
          <p className="text-body-lg text-on-surface-variant leading-relaxed h-[80px]">
            {steps[currentStep].content}
          </p>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mb-8 mt-2">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-primary' : 'w-2 bg-outline-variant'}`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
          <button 
            onClick={() => setIsOpen(false)}
            className="text-on-surface-variant font-semibold hover:text-on-surface px-4 py-2 rounded-lg transition-colors"
          >
            Lewati
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`px-4 py-2 font-semibold rounded-lg transition-colors ${currentStep === 0 ? 'text-on-surface-variant/30 cursor-not-allowed' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
            >
              Kembali
            </button>
            <button 
              onClick={() => {
                if (currentStep === steps.length - 1) {
                  setIsOpen(false);
                } else {
                  setCurrentStep(prev => prev + 1);
                }
              }}
              className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              {currentStep === steps.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
