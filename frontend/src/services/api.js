import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Backend FastAPI url
});

export default api;
