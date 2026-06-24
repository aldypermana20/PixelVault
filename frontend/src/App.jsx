import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import CodecPage from './components/ui/CodecPage';
import StegoPage from './components/ui/StegoPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/codec/image" replace />} />
          <Route path="/codec/image" element={<CodecPage title="Image Codec" type="image" />} />
          <Route path="/codec/audio" element={<CodecPage title="Audio Codec" type="audio" />} />
          <Route path="/codec/video" element={<CodecPage title="Video Codec" type="video" />} />
          <Route path="/stego/image" element={<StegoPage title="Image Steganography" type="image" />} />
          <Route path="/stego/audio" element={<StegoPage title="Audio Steganography" type="audio" />} />
          <Route path="/stego/video" element={<StegoPage title="Video Steganography" type="video" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
