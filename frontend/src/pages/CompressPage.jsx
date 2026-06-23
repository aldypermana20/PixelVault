import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Upload, File, Download, Cpu, HardDrive, Zap, 
  Image as ImageIcon, Music, Video, Check, RefreshCw, AlertCircle, Eye 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  compressHuffman, decompressHuffman, 
  compressDct, decompressDct,
  compressAudio, decompressAudio,
  compressVideo, decompressVideo
} from '../services/api';

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const CompressPage = () => {
  const [activeTab, setActiveTab] = useState('compress'); // 'compress' or 'decompress'
  const [mediaType, setMediaType] = useState('image'); // 'image', 'audio', 'video'
  const [algoType, setAlgoType] = useState('huffman'); // 'huffman' or 'dct' (only image), or 'structural' (video)
  const [audioMode, setAudioMode] = useState('lossless'); // 'lossless', 'lossy'
  const [videoScale, setVideoScale] = useState(0.5);
  const [videoFps, setVideoFps] = useState(15);
  const [quality, setQuality] = useState(85);
  
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const [reconImage, setReconImage] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const onDrop = (acceptedFiles) => {
    setError(null);
    setResult(null);
    setReconImage(null);
    
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

  const getAcceptedExtensions = () => {
    if (activeTab === 'compress') {
      if (mediaType === 'image') return { 'image/png': ['.png'], 'image/bmp': ['.bmp'] };
      if (mediaType === 'audio') return { 'audio/wav': ['.wav'] };
      if (mediaType === 'video') return { 'video/x-msvideo': ['.avi'] };
    } else {
      return { 
        'application/octet-stream': ['.huff', '.dct'],
        'video/x-msvideo': ['.avi'],
        'audio/wav': ['.wav'] // allow decompressing wav (for lossy decompression)
      };
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
      setError('Harap unggah file terlebih dahulu.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    setReconImage(null);
    
    try {
      let res;
      if (activeTab === 'compress') {
        if (mediaType === 'image') {
          if (algoType === 'dct') {
            res = await compressDct(file, quality);
          } else {
            res = await compressHuffman(file);
          }
        } else if (mediaType === 'audio') {
          res = await compressAudio(file, audioMode);
        } else if (mediaType === 'video') {
          res = await compressVideo(file, videoScale, videoFps);
        }
      } else {
        // Decompress
        if (file.name.endsWith('.dct')) {
          res = await decompressDct(file);
        } else if (file.name.endsWith('.huff')) {
          res = await decompressHuffman(file);
        } else if (file.name.endsWith('.wav')) {
          res = await decompressAudio(file);
        } else if (file.name.endsWith('.avi')) {
          res = await decompressVideo(file);
        } else {
          throw new Error('Format file tidak didukung untuk dekompresi. Gunakan berkas .huff, .dct, .wav, atau .avi.');
        }
      }
      
      setResult(res);
      
      // If image compression/decompression, handle displaying/comparing images
      if (activeTab === 'compress' && mediaType === 'image') {
        if (algoType === 'dct') {
          setReconImage(`http://localhost:8000${res.preview_url || res.download_url}`);
        } else {
          // Huffman is lossless, so reconstructed is same as original
          setReconImage(filePreview);
        }
      } else if (activeTab === 'decompress') {
        // If we decompressed a file, we want to preview the output if it's an image
        if (res.download_url.endsWith('.png') || res.download_url.endsWith('.jpg') || res.download_url.endsWith('.jpeg')) {
          setReconImage(`http://localhost:8000${res.download_url}`);
        }
      }
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Terjadi kesalahan saat memproses file.');
    } finally {
      setLoading(false);
    }
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

  const chartData = result && activeTab === 'compress' && result.compressed_size_bytes ? [
    { name: 'Asli', size: result.original_size_bytes, formatted: formatBytes(result.original_size_bytes) },
    { name: 'Kompresi', size: result.compressed_size_bytes, formatted: formatBytes(result.compressed_size_bytes) },
    ...(result.decompressed_size_bytes ? [{ name: 'Dekompresi', size: result.decompressed_size_bytes, formatted: formatBytes(result.decompressed_size_bytes) }] : [])
  ] : result && activeTab === 'decompress' && result.compressed_size_bytes && result.decompressed_size_bytes ? [
    { name: 'Terkompresi', size: result.compressed_size_bytes, formatted: formatBytes(result.compressed_size_bytes) },
    { name: 'Hasil Dekompresi', size: result.decompressed_size_bytes, formatted: formatBytes(result.decompressed_size_bytes) }
  ] : [];

  return (
    <div className="relative min-h-screen bg-dark-bg pt-28 pb-16 px-4">
      {/* Background Decorative Glows */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-dark-border mb-8 justify-center">
          <button
            onClick={() => { setActiveTab('compress'); setResult(null); setFile(null); setFilePreview(null); }}
            className={`px-8 py-3 text-lg font-bold font-display transition-all border-b-2 ${
              activeTab === 'compress' 
                ? 'border-primary text-primary neon-text-purple' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Kompresi (Encode)
          </button>
          <button
            onClick={() => { setActiveTab('decompress'); setResult(null); setFile(null); setFilePreview(null); }}
            className={`px-8 py-3 text-lg font-bold font-display transition-all border-b-2 ${
              activeTab === 'decompress' 
                ? 'border-primary text-primary neon-text-purple' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Dekompresi (Decode)
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Controls Panel */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-lg font-bold text-white mb-4 font-display flex items-center gap-2">
                <Cpu size={18} className="text-primary" />
                Konfigurasi
              </h3>
              
              {activeTab === 'compress' ? (
                <>
                  {/* Media Type Selection */}
                  <div className="mb-4">
                    <label className="text-xs text-slate-400 block mb-2 font-medium">Tipe Media</label>
                    <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => { setMediaType('image'); setAlgoType('huffman'); setFile(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                          mediaType === 'image' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ImageIcon size={12} />
                        Gambar
                      </button>
                      <button
                        onClick={() => { setMediaType('audio'); setAlgoType('huffman'); setFile(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                          mediaType === 'audio' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Music size={12} />
                        Audio
                      </button>
                      <button
                        onClick={() => { setMediaType('video'); setAlgoType('structural'); setFile(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                          mediaType === 'video' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Video size={12} />
                        Video
                      </button>
                    </div>
                  </div>

                  {/* Audio Compression Mode */}
                  {mediaType === 'audio' && (
                    <div className="mb-4">
                      <label className="text-xs text-slate-400 block mb-2 font-medium">Mode Audio</label>
                      <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => setAudioMode('lossless')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                            audioMode === 'lossless' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Lossless
                        </button>
                        <button
                          onClick={() => setAudioMode('lossy')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                            audioMode === 'lossy' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Lossy (Downsample)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Video Scaling Controls */}
                  {mediaType === 'video' && (
                    <>
                      {/* Video Scale Slider */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs text-slate-400 font-medium">Skala Spasial</label>
                          <span className="text-xs text-secondary font-bold font-display">{Math.round(videoScale * 100)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.1" 
                          max="1.0" 
                          step="0.1"
                          value={videoScale}
                          onChange={(e) => setVideoScale(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                          <span>10% (Kecil)</span>
                          <span>100% (Asli)</span>
                        </div>
                      </div>

                      {/* Video FPS Selection */}
                      <div className="mb-4">
                        <label className="text-xs text-slate-400 block mb-2 font-medium">Target FPS (Temporal)</label>
                        <select 
                          value={videoFps} 
                          onChange={(e) => setVideoFps(parseInt(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary"
                        >
                          <option value="10">10 FPS (Sangat Hemat)</option>
                          <option value="15">15 FPS (Hemat)</option>
                          <option value="24">24 FPS (Sinematik)</option>
                          <option value="30">30 FPS (Mulus)</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Algorithm Type Selection (Image only) */}
                  {mediaType === 'image' && (
                    <div className="mb-4">
                      <label className="text-xs text-slate-400 block mb-2 font-medium">Algoritma</label>
                      <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => setAlgoType('huffman')}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                            algoType === 'huffman' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Huffman
                        </button>
                        <button
                          onClick={() => setAlgoType('dct')}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                            algoType === 'dct' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          DCT
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quality Slider (DCT only) */}
                  {mediaType === 'image' && algoType === 'dct' && (
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-slate-400 font-medium">Faktor Kualitas (Q)</label>
                        <span className="text-xs text-secondary font-bold font-display">{quality}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>Kecil / Buruk</span>
                        <span>Besar / Bagus</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-400 text-xs leading-relaxed">
                  Unggah berkas hasil kompresi (**huff**, **dct**, **wav**, **avi**) sebelumnya untuk mengembalikannya ke format asli.
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
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    {activeTab === 'compress' ? 'Kompres Sekarang' : 'Dekompresi Sekarang'}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Upload & Output Panel */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-400 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Dropzone Upload */}
            {!result && (
              <div 
                {...getRootProps()} 
                className={`glass-card p-10 rounded-3xl border-dashed border-2 cursor-pointer transition-all duration-300 text-center flex flex-col items-center justify-center min-h-[300px] ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-slate-800 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 text-slate-400 mb-6">
                  <Upload size={28} className={isDragActive ? 'text-primary animate-bounce' : ''} />
                </div>
                
                {file ? (
                  <div>
                    <p className="text-white font-bold text-lg mb-2">{file.name}</p>
                    <p className="text-slate-400 text-sm">{formatBytes(file.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-bold text-lg mb-2">Seret & taruh file di sini</p>
                    <p className="text-slate-400 text-sm mb-4">atau klik untuk menelusuri</p>
                    <p className="text-[10px] text-slate-500">
                      {activeTab === 'compress'
                        ? (mediaType === 'image' ? 'Mendukung PNG, BMP' : mediaType === 'audio' ? 'Mendukung WAV' : 'Mendukung AVI (Video)')
                        : 'Mendukung file .huff, .dct, .wav, .avi'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="glass-card p-10 rounded-3xl min-h-[300px] flex flex-col items-center justify-center">
                <RefreshCw className="animate-spin text-primary mb-6" size={48} />
                <h4 className="text-white font-bold text-lg mb-2">Sedang Memproses Media</h4>
                <p className="text-slate-400 text-sm">Menjalankan engine pemrosesan PixelVault...</p>
              </div>
            )}

            {/* Result Panel */}
            {result && !loading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6"
              >
                <div className="glass-card p-6 rounded-3xl">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-xs font-bold mb-2">
                        <Check size={12} />
                        Selesai
                      </span>
                      <h4 className="text-xl font-bold text-white font-display">Hasil Pemrosesan</h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {mediaType === 'image' && (reconImage || filePreview) && (
                        <button
                          onClick={() => setIsFullscreen(true)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary hover:bg-secondary-hover text-white font-bold rounded-xl text-xs transition-all neon-glow-cyan cursor-pointer"
                        >
                          <Eye size={14} />
                          Fullscreen
                        </button>
                      )}
                      <button 
                        onClick={() => handleDownloadFile(`http://localhost:8000${result.download_url}`)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs transition-all neon-glow-purple cursor-pointer"
                      >
                        <Download size={14} />
                        Unduh Hasil
                      </button>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {activeTab === 'compress' && result.original_size_bytes && (
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                          <File size={14} />
                          <span>Ukuran Asli</span>
                        </div>
                        <div className="text-sm font-bold text-white font-display truncate">
                          {formatBytes(result.original_size_bytes)}
                        </div>
                      </div>
                    )}

                    {result.compressed_size_bytes && (
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                          <HardDrive size={14} />
                          <span>{activeTab === 'compress' ? 'Terkompresi' : 'Input'}</span>
                        </div>
                        <div className="text-sm font-bold text-secondary font-display truncate">
                          {formatBytes(result.compressed_size_bytes)}
                        </div>
                      </div>
                    )}

                    {result.decompressed_size_bytes && (
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                          <File size={14} />
                          <span>Terdekompresi</span>
                        </div>
                        <div className="text-sm font-bold text-green-400 font-display truncate">
                          {formatBytes(result.decompressed_size_bytes)}
                        </div>
                      </div>
                    )}

                    {result.compression_ratio && (
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                          <HardDrive size={14} />
                          <span>Rasio</span>
                        </div>
                        <div className="text-xl font-extrabold text-white font-display">
                          {result.compression_ratio}
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                        <Zap size={14} />
                        <span>Durasi</span>
                      </div>
                      <div className="text-xl font-extrabold text-white font-display">
                        {result.execution_time_ms} ms
                      </div>
                    </div>

                    {result.psnr_db !== undefined && (
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                          <Cpu size={14} />
                          <span>PSNR</span>
                        </div>
                        <div className="text-xl font-extrabold text-secondary font-display">
                          {result.psnr_db === 99.0 ? 'Lossless' : `${result.psnr_db} dB`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Size Comparison Chart */}
                  {chartData.length > 0 && (
                    <div className="h-44 w-full bg-slate-950/20 p-4 rounded-2xl border border-slate-900/60 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" barSize={16}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={100} />
                          <Tooltip 
                            formatter={(value) => formatBytes(value)} 
                            contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4338ca', borderRadius: '12px', color: '#fff' }}
                          />
                          <Bar dataKey="size" radius={[0, 8, 8, 0]}>
                            {chartData.map((entry, index) => {
                              const colors = ['#7c3aed', '#06b6d4', '#22c55e'];
                              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Audio Playback Player */}
                  {result && (result.download_url.endsWith('.wav') || (activeTab === 'decompress' && file.name.endsWith('.wav'))) && (
                    <div className="mt-4 mb-6 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                      <label className="text-xs text-slate-400 block mb-2 font-semibold">Putar Hasil Audio</label>
                      <audio controls className="w-full" src={`http://localhost:8000${result.download_url}`} />
                    </div>
                  )}

                  {/* Video Playback Information */}
                  {result && result.download_url.endsWith('.avi') && (
                    <div className="mt-4 mb-6 bg-slate-950/40 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-start gap-2">
                      <AlertCircle size={16} className="text-secondary shrink-0 mt-0.5" />
                      <span>
                        Berkas hasil kompresi video disimpan dalam format kontainer <strong>AVI (MJPEG)</strong>. Silakan unduh berkas menggunakan tombol di atas untuk memutarnya di pemutar media lokal Anda (seperti VLC Player).
                      </span>
                    </div>
                  )}

                  {/* Image Comparison Slider */}
                  {reconImage && filePreview && (
                    <div>
                      <label className="text-xs text-slate-400 block mb-3 font-semibold">Visualisasi Sebelum vs Sesudah (Geser Gambar)</label>
                      <div className="relative w-full overflow-hidden rounded-2xl border border-dark-border select-none max-h-[350px]">
                        {/* Original Image */}
                        <img 
                          src={filePreview} 
                          className="w-full h-auto max-h-[350px] object-contain block" 
                          alt="Original" 
                        />
                        
                        {/* Reconstructed Image (Clapped overlay) */}
                        <div 
                          className="absolute inset-0 overflow-hidden" 
                          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                        >
                          <img 
                            src={reconImage} 
                            className="w-full h-auto max-h-[350px] object-contain block" 
                            alt="Reconstructed" 
                          />
                        </div>
                        
                        {/* Slider Handle Line */}
                        <div 
                          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize pointer-events-none"
                          style={{ left: `${sliderPosition}%` }}
                        >
                          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary border-2 border-white text-white shadow-lg flex items-center justify-center font-bold text-xs pointer-events-auto cursor-ew-resize">
                            ↔
                          </div>
                        </div>
                        
                        {/* Transparent Slider controller overlay */}
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={sliderPosition} 
                          onChange={(e) => setSliderPosition(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize" 
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                        <span>Original</span>
                        <span>Hasil Rekonstruksi</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => { setResult(null); setFile(null); setFilePreview(null); setReconImage(null); }}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all duration-300"
                >
                  Proses File Lainnya
                </button>
              </motion.div>
            )}
          </div>
        </div>
        {/* Fullscreen Image Overlay */}
        <AnimatePresence>
          {isFullscreen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
              onClick={() => setIsFullscreen(false)}
            >
              <button 
                className="absolute top-6 right-6 text-white hover:text-primary transition-colors bg-slate-900/60 p-3 rounded-full border border-slate-800 cursor-pointer"
                onClick={() => setIsFullscreen(false)}
              >
                ✕
              </button>
              <motion.img 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                src={reconImage || filePreview} 
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-slate-800" 
                alt="Fullscreen Preview"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompressPage;
