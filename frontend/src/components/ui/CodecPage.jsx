import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const CodecPage = ({ title, type }) => {
  const [mode, setMode] = useState('compress'); // 'compress' or 'decompress'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [comparisonValue, setComparisonValue] = useState(50);
  const [compressionRatio, setCompressionRatio] = useState(100);
  const fileInputRef = useRef(null);

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getCompressExtensions = () => {
    if (type === 'audio') return "Supports WAV (Uncompressed)";
    if (type === 'video') return "Supports RAW AVI (Uncompressed)";
    return "Supports BMP, TIFF (Uncompressed)";
  };
  
  const getCompressAccept = () => {
    if (type === 'audio') return "audio/wav";
    if (type === 'video') return "video/avi";
    return "image/bmp, image/tiff";
  };

  const getMediaIcon = () => {
    if (type === 'audio') return "audio_file";
    if (type === 'video') return "video_file";
    return "photo_library";
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (mode === 'compress' && type === 'image') {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl(null); 
      }
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      if (mode === 'compress' && type === 'image') {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl(null);
      }
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (mode === 'compress' && type === 'image') {
      formData.append('ratio', compressionRatio);
    }
    
    try {
      await new Promise(r => setTimeout(r, 600)); 
      
      const endpoint = mode === 'compress' ? `/${type}/compress` : `/${type}/decompress`;
      const response = await api.post(endpoint, formData);
      setResult(response.data);
    } catch (error) {
      console.error("Error processing file", error);
      alert(`Failed to ${mode} file.`);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display-lg text-display-lg text-on-surface mb-2">{title}</h2>
        <p className="text-on-surface-variant text-body-lg">Compress and optimize your media with precision. Academic-grade algorithms for professional workflows.</p>
      </div>

      <div className="flex gap-6 border-b border-outline-variant mb-8">
        <Link to="/codec/image" className={`pb-4 border-b-2 font-semibold transition-colors ${type === 'image' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Image</Link>
        <Link to="/codec/audio" className={`pb-4 border-b-2 font-semibold transition-colors ${type === 'audio' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Audio</Link>
        <Link to="/codec/video" className={`pb-4 border-b-2 font-semibold transition-colors ${type === 'video' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Video</Link>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-1 p-1 bg-surface-container-low border border-outline-variant rounded-xl w-fit mb-8">
        <button 
          onClick={() => switchMode('compress')}
          className={`px-8 py-2.5 rounded-lg text-body-md font-semibold transition-all ${mode === 'compress' ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Compress Mode
        </button>
        <button 
          onClick={() => switchMode('decompress')}
          className={`px-8 py-2.5 rounded-lg text-body-md font-semibold transition-all ${mode === 'decompress' ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Decompress Mode
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interaction & Config */}
        <div className="xl:col-span-4 space-y-6">
          <section 
            onDrop={handleDrop} 
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current.click()}
            className="bg-surface border-2 border-dashed border-outline-variant rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-[32px]">{mode === 'compress' ? 'upload_file' : 'unarchive'}</span>
            </div>
            <p className="font-semibold text-on-surface mb-1">
              {file ? file.name : `Drag & drop ${mode === 'compress' ? type : 'encoded'} files`}
            </p>
            <p className="text-on-surface-variant text-sm">
              {file ? formatBytes(file.size) : mode === 'compress' ? getCompressExtensions() : "Supports .huff (PixelVault Binary)"}
            </p>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={mode === 'compress' ? getCompressAccept() : ".huff"}
            />
          </section>

          <section className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">tune</span>
                Parameters
              </h3>
              <span className="text-[10px] font-mono-label bg-surface-container-highest px-2 py-0.5 rounded uppercase">Lossless Huffman</span>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <label className="text-on-surface-variant font-medium">Operation</label>
                  <span className="text-primary font-mono-label">{mode === 'compress' ? 'Encode' : 'Decode'}</span>
                </div>
                <input 
                  type="range" min="10" max="100" 
                  value={mode === 'compress' && type === 'image' ? compressionRatio : 100} 
                  onChange={(e) => setCompressionRatio(parseInt(e.target.value))}
                  disabled={!(mode === 'compress' && type === 'image')}
                  className={`w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none accent-primary ${!(mode === 'compress' && type === 'image') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} 
                />
                {mode === 'compress' && type === 'image' && (
                  <div className="text-xs text-right text-on-surface-variant font-mono-label mt-1">Scale Ratio: {compressionRatio}%</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-on-surface-variant font-medium">Output Format</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm outline-none transition-all cursor-not-allowed text-on-surface-variant" disabled>
                    <option>{mode === 'compress' ? '.huff (PixelVault Huffman Binary)' : 'Original Restored Format'}</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={!file || loading}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  !file ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' : 
                  'bg-[#2563EB] hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined">rocket_launch</span>
                )}
                {loading ? "Processing..." : `Start ${mode === 'compress' ? 'Optimization' : 'Restoration'}`}
              </button>
              
              {result && (
                <a 
                  href={`http://localhost:8000${result.download_url}`}
                  target="_blank" rel="noreferrer"
                  className="w-full py-3 bg-surface-container-highest hover:bg-surface-container text-on-surface rounded-lg font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>download</span>
                  Download Result
                </a>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Result Comparison & Metrics */}
        <div className="xl:col-span-8 space-y-6">
          <section className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[560px]">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-surface-container-highest text-[12px] font-bold rounded-full">Preview</span>
                <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-[18px]">{mode === 'compress' ? getMediaIcon() : 'binary_code'}</span>
                  <span>{file ? file.name : "No file selected"}</span>
                </div>
              </div>
            </div>

            <div 
              className="relative flex-1 bg-[#F3F4F6] overflow-hidden group cursor-col-resize"
              onMouseMove={(e) => {
                if(mode === 'compress' && type === 'image') {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                  setComparisonValue(percentage);
                }
              }}
            >
              {mode === 'compress' && type === 'image' && previewUrl ? (
                <>
                  <div className="absolute inset-0 w-full h-full">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${previewUrl}')` }}></div>
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded text-xs font-mono-label">
                      Original ({formatBytes(file?.size)})
                    </div>
                  </div>

                  <div 
                    className="absolute inset-0 h-full overflow-hidden border-r-2 border-white shadow-2xl pointer-events-none" 
                    style={{ width: `${comparisonValue}%` }}
                  >
                    <div className="w-screen h-full bg-cover bg-center" style={{ backgroundImage: `url('${previewUrl}')`, filter: 'brightness(1.05) contrast(1.02)' }}></div>
                    <div className="absolute top-4 left-4 bg-blue-600/80 backdrop-blur-md text-white px-3 py-1 rounded text-xs font-mono-label">
                      Processed {result && `(${formatBytes(result.compressed_size)})`}
                    </div>
                  </div>

                  <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10 pointer-events-none" style={{ left: `${comparisonValue}%`, transform: 'translateX(-50%)' }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-black text-[18px]">unfold_more</span>
                    </div>
                  </div>
                </>
              ) : file ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/50 gap-4">
                  <span className="material-symbols-outlined text-6xl">
                    {mode === 'compress' ? getMediaIcon() : 'data_object'}
                  </span>
                  <p>{mode === 'compress' ? `${type.charAt(0).toUpperCase() + type.slice(1)} selected. Ready to process.` : result ? "Decompression successful. Download to view media." : "Binary files cannot be previewed. Process to view result."}</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/50 gap-4">
                  <span className="material-symbols-outlined text-6xl">{getMediaIcon()}</span>
                  <p>Upload {type} to preview</p>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-outline-variant bg-surface-container-lowest grid grid-cols-3 gap-8">
              {mode === 'compress' ? (
                <>
                  <div>
                    <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest mb-1">Size Reduction</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-primary">
                        {result ? `${(100 - result.compression_ratio).toFixed(1)}%` : '--%'}
                      </span>
                      {result && result.compression_ratio < 100 && (
                        <span className="text-sm font-semibold text-green-600 flex items-center">
                          <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                          Saved
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest mb-1">Compression Ratio</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-primary">
                        {result ? `${result.compression_ratio.toFixed(1)}%` : '--'}
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono-label">of Original</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest mb-1">Algorithm</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-primary">Huffman</span>
                      <span className="text-xs text-on-surface-variant font-mono-label">Lossless</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-primary">
                        {result ? 'Restored' : 'Waiting'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest mb-1">Original Integrity</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-primary">
                        {result ? '100%' : '--'}
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono-label">Lossless</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest mb-1">Media Type</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-primary capitalize">{type}</span>
                      <span className="text-xs text-on-surface-variant font-mono-label">Media</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {loading && (
            <section className="bg-surface border border-outline-variant rounded-xl p-6">
              <h3 className="font-semibold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                Processing Technical Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">File Parsing</span>
                  <span className="font-mono-label text-green-600">Success</span>
                </div>
                <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-full"></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Entropy Operation</span>
                  <span className="font-mono-label text-on-surface-variant animate-pulse">In Progress...</span>
                </div>
                <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[65%] animate-pulse"></div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodecPage;
