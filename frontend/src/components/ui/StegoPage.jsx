import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StegoPage = ({ title, type }) => {
  const [mode, setMode] = useState('embed'); // 'embed' or 'extract'
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const getEmbedExtensions = () => {
    if (type === 'audio') return "Supports WAV, FLAC (Lossless)";
    if (type === 'video') return "Supports AVI (Lossless)";
    return "Supports PNG, BMP (Lossless)";
  };

  const getExtractExtensions = () => {
    if (type === 'audio') return "Supports WAV, FLAC";
    if (type === 'video') return "Supports AVI";
    return "Supports PNG, BMP";
  };

  const getAccept = () => {
    if (type === 'audio') return "audio/wav, audio/flac";
    if (type === 'video') return "video/avi";
    return "image/png, image/bmp";
  };

  const getMediaIcon = () => {
    if (type === 'audio') return "audio_file";
    if (type === 'video') return "video_file";
    return "image";
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (type === 'image') {
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
      if (type === 'image') {
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

  const handleEmbed = async () => {
    if (!file || !message) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('secret_message', message);

    try {
      const response = await api.post(`/stego/${type}/embed`, formData);
      setResult(response.data);
    } catch (error) {
      console.error("Error embedding message", error);
      alert("Failed to embed message.");
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/stego/${type}/extract`, formData);
      setResult(response.data);
    } catch (error) {
      console.error("Error extracting message", error);
      alert("Failed to extract message.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setMessage('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="font-display-lg text-display-lg text-primary tracking-tight">{title}</h2>
        <p className="text-on-surface-variant font-body-lg mt-2 max-w-2xl">Encode secret information within digital media using advanced Least Significant Bit (LSB) manipulation.</p>
      </div>

      <div className="flex gap-6 border-b border-outline-variant mb-8">
        <Link to="/stego/image" className={`pb-4 border-b-2 font-semibold transition-colors ${type === 'image' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Image</Link>
        <Link to="/stego/audio" className={`pb-4 border-b-2 font-semibold transition-colors ${type === 'audio' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Audio</Link>
        <Link to="/stego/video" className={`pb-4 border-b-2 font-semibold transition-colors ${type === 'video' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Video</Link>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-1 p-1 bg-surface-container-low border border-outline-variant rounded-xl w-fit mb-8">
        <button 
          onClick={() => switchMode('embed')}
          className={`px-8 py-2.5 rounded-lg text-body-md font-semibold transition-all ${mode === 'embed' ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Embed Mode
        </button>
        <button 
          onClick={() => switchMode('extract')}
          className={`px-8 py-2.5 rounded-lg text-body-md font-semibold transition-all ${mode === 'extract' ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Extract Mode
        </button>
      </div>

      {mode === 'embed' ? (
        /* EMBED MODE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left: Control Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-[16px]">
              <h3 className="font-title-md text-title-md text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">edit_note</span>
                Message Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-label-sm text-on-surface-variant mb-2">Secret Message</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-40 bg-surface border border-outline-variant rounded-[10px] p-4 text-body-md focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none" 
                    placeholder="Type the message you wish to hide..."
                  ></textarea>
                </div>
                
                <button 
                  onClick={handleEmbed}
                  disabled={!file || !message || loading}
                  className={`w-full py-4 rounded-[10px] font-bold text-body-lg flex items-center justify-center gap-2 transition-all ${(!file || !message) ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]'}`}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined">lock</span>
                  )}
                  {loading ? 'Processing...' : 'Embed Message'}
                </button>

                {result && result.download_url && (
                  <a 
                    href={`http://localhost:8000${result.download_url}`}
                    target="_blank" rel="noreferrer"
                    className="w-full mt-2 py-4 bg-secondary-container text-on-secondary-container rounded-[10px] font-bold text-body-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>download</span>
                    Download Stego-Media
                  </a>
                )}
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-[16px]">
              <h4 className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-4">Algorithm Details</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-outline-variant">
                  <span className="text-body-md text-on-surface-variant">Method</span>
                  <span className="font-mono-label text-primary">LSB Replacement</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-body-md text-on-surface-variant">Payload Capacity</span>
                  <span className="font-mono-label text-primary">Dependent on Media</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Visual Preview */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-[16px] relative group overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                <span className="font-label-sm text-on-surface-variant">Source Media Preview</span>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                  <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                  <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                </div>
              </div>
              
              <div 
                className="flex-1 flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-surface-container-low transition-colors group relative"
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {type === 'image' && previewUrl ? (
                  <div className="absolute inset-0 w-full h-full p-4 flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[32px] text-primary">{getMediaIcon()}</span>
                    </div>
                    <h4 className="font-title-md text-primary">{file.name}</h4>
                    <p className="text-on-surface-variant text-body-md mt-2">Ready to embed message.</p>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[32px] text-on-surface-variant">cloud_upload</span>
                    </div>
                    <h4 className="font-title-md text-primary">Upload Carrier Media</h4>
                    <p className="text-on-surface-variant text-body-md mt-2">Drag and drop or click to browse. {getEmbedExtensions()}</p>
                  </>
                )}
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept={getAccept()} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="h-32 bg-surface-container-lowest border border-outline-variant rounded-[16px] flex flex-col items-center justify-center grayscale opacity-40">
                <span className="material-symbols-outlined text-on-surface-variant">image</span>
                <span className="text-[10px] mt-1 font-mono-label uppercase">Bit Plane 0</span>
              </div>
              <div className="h-32 bg-surface-container-lowest border border-outline-variant rounded-[16px] flex flex-col items-center justify-center grayscale opacity-40">
                <span className="material-symbols-outlined text-on-surface-variant">analytics</span>
                <span className="text-[10px] mt-1 font-mono-label uppercase">Histogram</span>
              </div>
              <div className="h-32 bg-surface-container-lowest border border-outline-variant rounded-[16px] flex flex-col items-center justify-center grayscale opacity-40">
                <span className="material-symbols-outlined text-on-surface-variant">visibility_off</span>
                <span className="text-[10px] mt-1 font-mono-label uppercase">Diff View</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* EXTRACT MODE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left: Upload area */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div 
              className="h-[400px] bg-surface-container-lowest border border-outline-variant rounded-[16px] relative flex flex-col items-center justify-center text-center p-12 cursor-pointer hover:bg-surface-container-low transition-colors"
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {type === 'image' && previewUrl ? (
                <div className="absolute inset-0 w-full h-full p-4 flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-md opacity-80" />
                </div>
              ) : file ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[32px] text-on-secondary-container">{getMediaIcon()}</span>
                    </div>
                    <h4 className="font-title-md text-primary">{file.name}</h4>
                    <p className="text-on-surface-variant text-body-md mt-2">Ready to extract message.</p>
                  </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[32px] text-on-secondary-container">upload_file</span>
                  </div>
                  <h4 className="font-title-md text-primary">Select Stego-Media</h4>
                  <p className="text-on-surface-variant text-body-md mt-2">Upload the media containing the hidden message for extraction. {getExtractExtensions()}</p>
                </>
              )}
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept={getAccept()} />
            </div>

            <button 
              onClick={handleExtract}
              disabled={!file || loading}
              className={`w-full py-4 rounded-[10px] font-bold text-body-lg flex items-center justify-center gap-2 transition-all ${!file ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]'}`}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined">key</span>
              )}
              {loading ? 'Extracting...' : 'Extract Message'}
            </button>
          </div>

          {/* Right: Result Display */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-[16px] h-full flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-title-md text-title-md text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">output</span>
                  Result Display
                </h3>
              </div>
              
              <div className="flex-1 bg-surface border border-outline-variant rounded-[10px] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {result && result.secret_message ? (
                  <div className="w-full h-full text-left bg-surface-container-lowest p-4 rounded border border-outline-variant overflow-y-auto">
                    <p className="font-mono-label text-primary break-words whitespace-pre-wrap">
                      {result.secret_message}
                    </p>
                  </div>
                ) : (
                  <div className="opacity-30 flex flex-col items-center">
                    <span className="material-symbols-outlined text-[48px] mb-4">search_off</span>
                    <p className="text-body-md">No message extracted yet.<br/>Upload a file and extract to begin analysis.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-tertiary-fixed/10 border border-tertiary-fixed-dim rounded-[10px] flex items-start gap-4">
                <span className="material-symbols-outlined text-on-tertiary-fixed-variant mt-0.5">info</span>
                <p className="text-label-sm text-on-tertiary-fixed-variant leading-relaxed">
                  Note: This tool performs exhaustive LSB extraction across media channels. It reads until the termination bit marker.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StegoPage;
