import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, Download, Lock, Unlock, Eye, HelpCircle, 
  Image as ImageIcon, Music, Video, AlertCircle, CheckCircle, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  encodeImageStego, decodeImageStego,
  encodeAudioStego, decodeAudioStego,
  encodeVideoStego, decodeVideoStego
} from '../services/api';

const StegoPage = () => {
  const [activeTab, setActiveTab] = useState('encode'); // 'encode' or 'decode'
  const [mediaType, setMediaType] = useState('image'); // 'image', 'audio', 'video'
  
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  const [message, setMessage] = useState('');
  const [frameIndex, setFrameIndex] = useState(0);
  
  const [capacity, setCapacity] = useState(null); // in characters
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  // Decoding specific result
  const [decodedMessage, setDecodedMessage] = useState('');
  const [animatedText, setAnimatedText] = useState('');

  // Re-calculate image capacity on upload
  useEffect(() => {
    if (file && mediaType === 'image' && activeTab === 'encode') {
      const img = new Image();
      img.onload = () => {
        const capBits = img.width * img.height * 3;
        const capChars = Math.floor(capBits / 8) - 9; // subtract 9 for delimiter '###END###'
        setCapacity(capChars);
      };
      img.src = filePreview;
    } else {
      setCapacity(null);
    }
  }, [file, mediaType, filePreview, activeTab]);

  const onDrop = (acceptedFiles) => {
    setError(null);
    setResult(null);
    setDecodedMessage('');
    setAnimatedText('');
    
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    
    if (uploadedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(uploadedFile);
    } else {
      setFilePreview(null);
    }
  };

  // Set file extensions based on media type
  const getAcceptedExtensions = () => {
    if (activeTab === 'encode') {
      if (mediaType === 'image') return { 'image/png': ['.png'], 'image/bmp': ['.bmp'] };
      if (mediaType === 'audio') return { 'audio/wav': ['.wav'] };
      if (mediaType === 'video') return { 'video/x-msvideo': ['.avi'] };
    } else {
      // Decode accepts stego files
      if (mediaType === 'image') return { 'image/png': ['.png'] };
      if (mediaType === 'audio') return { 'audio/wav': ['.wav'] };
      if (mediaType === 'video') return { 'video/x-msvideo': ['.avi'] };
    }
    return {};
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: getAcceptedExtensions()
  });

  const handleProcess = async () => {
    if (!file) {
      setError('Harap unggah file media terlebih dahulu.');
      return;
    }
    
    if (activeTab === 'encode' && !message) {
      setError('Harap masukkan pesan rahasia yang ingin disisipkan.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    setDecodedMessage('');
    setAnimatedText('');
    
    try {
      if (activeTab === 'encode') {
        let res;
        if (mediaType === 'image') {
          res = await encodeImageStego(file, message);
        } else if (mediaType === 'audio') {
          res = await encodeAudioStego(file, message);
        } else {
          // video
          res = await encodeVideoStego(file, message, frameIndex);
        }
        setResult(res);
      } else {
        // decode
        let res;
        if (mediaType === 'image') {
          res = await decodeImageStego(file);
        } else if (mediaType === 'audio') {
          res = await decodeAudioStego(file);
        } else {
          res = await decodeVideoStego(file, frameIndex);
        }
        setDecodedMessage(res.message);
        triggerTextAnimation(res.message);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Terjadi kesalahan saat memproses media.');
    } finally {
      setLoading(false);
    }
  };

  // Typist animation for decrypted text
  const triggerTextAnimation = (text) => {
    let index = 0;
    setAnimatedText('');
    const interval = setInterval(() => {
      if (index < text.length) {
        setAnimatedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30); // 30ms per char
  };

  const handleDownloadFile = async (url) => {
    try {
      const filename = url.split('/').pop();
      const downloadUrl = `http://localhost:8000/api/download?path=${filename}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download request failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed, falling back to location.href:', err);
      const filename = url.split('/').pop();
      window.location.href = `http://localhost:8000/api/download?path=${filename}`;
    }
  };

  return (
    <div className="relative min-h-screen bg-dark-bg pt-28 pb-16 px-4">
      {/* Background radial glows */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-dark-border mb-8 justify-center">
          <button
            onClick={() => { setActiveTab('encode'); setResult(null); setDecodedMessage(''); setFile(null); setFilePreview(null); setMessage(''); }}
            className={`px-8 py-3 text-lg font-bold font-display transition-all border-b-2 ${
              activeTab === 'encode' 
                ? 'border-primary text-primary neon-text-purple' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Sisipkan Pesan (Encode)
          </button>
          <button
            onClick={() => { setActiveTab('decode'); setResult(null); setDecodedMessage(''); setFile(null); setFilePreview(null); }}
            className={`px-8 py-3 text-lg font-bold font-display transition-all border-b-2 ${
              activeTab === 'decode' 
                ? 'border-primary text-primary neon-text-purple' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Ekstrak Pesan (Decode)
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Configuration Controls */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-lg font-bold text-white mb-4 font-display flex items-center gap-2">
                <Lock size={18} className="text-primary" />
                Pengaturan
              </h3>

              {/* Media selection */}
              <div className="mb-4">
                <label className="text-xs text-slate-400 block mb-2 font-medium">Tipe Media Cover</label>
                <div className="flex flex-col gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => { setMediaType('image'); setFile(null); }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      mediaType === 'image' ? 'bg-primary text-white neon-glow-purple' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon size={14} />
                    Gambar Penampung (PNG)
                  </button>
                  <button
                    onClick={() => { setMediaType('audio'); setFile(null); }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      mediaType === 'audio' ? 'bg-primary text-white neon-glow-purple' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Music size={14} />
                    Audio Penampung (WAV)
                  </button>
                  <button
                    onClick={() => { setMediaType('video'); setFile(null); }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      mediaType === 'video' ? 'bg-primary text-white neon-glow-purple' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Video size={14} />
                    Video Penampung (AVI)
                  </button>
                </div>
              </div>

              {/* Video Frame Index (only when video) */}
              {mediaType === 'video' && (
                <div className="mb-2">
                  <label className="text-xs text-slate-400 block mb-2 font-medium">Target Indeks Frame</label>
                  <input
                    type="number"
                    min="0"
                    value={frameIndex}
                    onChange={(e) => setFrameIndex(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Frame index tempat teks disisipkan/diekstrak.
                  </span>
                </div>
              )}
            </div>

            {file && (
              <button
                onClick={handleProcess}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-secondary hover:bg-secondary-hover text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 neon-glow-cyan"
              >
                {loading ? (
                  <span>Memproses...</span>
                ) : activeTab === 'encode' ? (
                  <>
                    <Lock size={18} />
                    Sisipkan Pesan
                  </>
                ) : (
                  <>
                    <Unlock size={18} />
                    Ekstrak Pesan
                  </>
                )}
              </button>
            )}
          </div>

          {/* Stego Main Area */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-400 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Dropzone Area */}
            {!result && !decodedMessage && !loading && (
              <div 
                {...getRootProps()} 
                className={`glass-card p-10 rounded-3xl border-dashed border-2 cursor-pointer transition-all duration-300 text-center flex flex-col items-center justify-center min-h-[220px] ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-slate-800 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 text-slate-400 mb-4">
                  <Upload size={28} className={isDragActive ? 'text-primary animate-bounce' : ''} />
                </div>
                
                {file ? (
                  <div>
                    <p className="text-white font-bold text-md mb-1">{file.name}</p>
                    <p className="text-slate-400 text-xs">
                      {Math.round(file.size / 1024)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-bold text-md mb-1">
                      Seret & taruh file {mediaType.toUpperCase()} di sini
                    </p>
                    <p className="text-slate-400 text-xs">
                      atau klik untuk memilih file
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="glass-card p-10 rounded-3xl min-h-[220px] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-6"></div>
                <h4 className="text-white font-bold text-lg mb-2">Memproses Steganografi LSB</h4>
                <p className="text-slate-400 text-sm">Sedang {activeTab === 'encode' ? 'menyembunyikan' : 'mengekstrak'} bit pesan...</p>
              </div>
            )}

            {/* Input Message Area (Encode only) */}
            {activeTab === 'encode' && file && !result && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-3xl"
              >
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-white font-display">Tulis Pesan Rahasia</label>
                  {capacity !== null && (
                    <span className={`text-xs font-bold font-display ${
                      message.length > capacity ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      Kapasitas: {message.length}/{capacity} Karakter
                    </span>
                  )}
                </div>
                
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Masukkan pesan rahasia di sini..."
                  rows={5}
                  className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-2xl p-4 text-sm focus:outline-none focus:border-primary resize-none placeholder-slate-600 mb-2"
                />
                
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  Pesan Anda akan diubah menjadi representasi biner dan disisipkan pada Least Significant Bit file. Penanda akhiran `###END###` ditambahkan secara otomatis.
                </span>
              </motion.div>
            )}

            {/* Success Encode Result */}
            {activeTab === 'encode' && result && !loading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 rounded-3xl text-center"
              >
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center text-green-400 mx-auto mb-6">
                  <CheckCircle size={32} />
                </div>
                
                <h4 className="text-2xl font-bold text-white font-display mb-2">Penyisipan Berhasil!</h4>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">
                  Pesan Anda berhasil disisipkan secara tidak terlihat pada media. File stego siap diunduh.
                </p>
                
                <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-2xl flex items-center justify-between mb-8 text-left">
                  <div>
                    <p className="text-xs text-slate-500">Waktu Pemrosesan</p>
                    <p className="text-sm font-bold text-white font-display">{result.execution_time_ms} ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Format Output</p>
                    <p className="text-sm font-bold text-secondary font-display">{mediaType === 'image' ? 'PNG (Lossless)' : mediaType.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => handleDownloadFile(`http://localhost:8000${result.download_url}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all neon-glow-purple cursor-pointer"
                  >
                    <Download size={18} />
                    Unduh File Stego
                  </button>
                  <button
                    onClick={() => { setResult(null); setFile(null); setMessage(''); }}
                    className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all"
                  >
                    Ulangi
                  </button>
                </div>
              </motion.div>
            )}

            {/* Success Decode Result */}
            {activeTab === 'decode' && decodedMessage && !loading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 rounded-3xl"
              >
                <div className="flex items-center gap-2 text-secondary mb-4 border-b border-dark-border pb-3">
                  <Terminal size={18} className="animate-pulse" />
                  <h4 className="text-md font-bold font-display text-white">Hasil Dekripsi LSB</h4>
                </div>

                {/* Animated terminal display */}
                <div className="w-full bg-black/80 border border-slate-900 rounded-2xl p-6 font-mono text-green-400 text-sm min-h-[150px] leading-relaxed break-all select-all">
                  <span className="text-slate-500 select-none mr-2">$ cat secret_message.txt</span>
                  <br />
                  <span>{animatedText}</span>
                  <span className="animate-ping font-extrabold text-green-400">|</span>
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-4">
                  <span>Waktu Pembongkaran: {result?.execution_time_ms || 12} ms</span>
                  <button
                    onClick={() => { setDecodedMessage(''); setAnimatedText(''); setFile(null); }}
                    className="text-primary hover:text-primary-hover font-semibold"
                  >
                    Ekstrak File Lain
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StegoPage;
