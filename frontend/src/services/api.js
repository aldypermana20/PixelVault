import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const compressHuffman = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/compress/huffman', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const decompressHuffman = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/decompress/huffman', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const compressDct = async (file, quality) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', quality);
  const response = await api.post('/compress/dct', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const decompressDct = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/decompress/dct', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const encodeImageStego = async (file, message) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('message', message);
  const response = await api.post('/stego/image/encode', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const decodeImageStego = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/stego/image/decode', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const encodeAudioStego = async (file, message) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('message', message);
  const response = await api.post('/stego/audio/encode', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const decodeAudioStego = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/stego/audio/decode', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const encodeVideoStego = async (file, message, frameIndex) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('message', message);
  formData.append('frame_index', frameIndex);
  const response = await api.post('/stego/video/encode', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const decodeVideoStego = async (file, frameIndex) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('frame_index', frameIndex);
  const response = await api.post('/stego/video/decode', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const compressAudio = async (file, mode) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode);
  const response = await api.post('/compress/audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const decompressAudio = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/decompress/audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const compressVideo = async (file, scale, targetFps) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('scale', scale);
  formData.append('target_fps', targetFps);
  const response = await api.post('/compress/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const decompressVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/decompress/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default api;
