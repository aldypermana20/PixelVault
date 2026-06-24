# Panduan Menjalankan Aplikasi

Aplikasi "MultiMedia Codec & Steganography Studio" terdiri dari 2 bagian: Backend (Python FastAPI) dan Frontend (React Vite). Keduanya harus berjalan secara bersamaan agar sistem berfungsi penuh.

## 1. Menjalankan Backend
Buka terminal/Command Prompt baru, lalu navigasikan ke folder proyek:
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Pastikan muncul tulisan *Application startup complete*. Backend berjalan di `http://localhost:8000`. API Swagger Docs tersedia di `http://localhost:8000/docs`.

## 2. Menjalankan Frontend
Buka terminal/Command Prompt lain, lalu navigasikan ke folder proyek:
```bash
cd frontend
npm install
npm run dev
```
Buka browser dan akses tautan yang muncul (biasanya `http://localhost:5173`).

---

**Troubleshooting:**
- Jika terjadi error CORS, pastikan URL backend di `frontend/src/services/api.js` sudah menunjuk ke `http://localhost:8000/api`.
- Hasil kompresi dan steganografi sementara disimpan di folder `backend/app/temp/`. Folder ini bisa dihapus isinya secara berkala.
