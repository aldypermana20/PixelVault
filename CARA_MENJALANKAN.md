# 🚀 Cara Menjalankan Project PixelVault

Panduan singkat untuk menginstal dependensi dan menjalankan aplikasi web **PixelVault** di komputer lokal Anda.

---

## 📋 Prasyarat
Sebelum memulai, pastikan Anda sudah menginstal:
* **Python 3.10+**
* **Node.js (versi LTS direkomendasikan)**

---

## 🛠️ Langkah-Langkah Menjalankan

Aplikasi ini menggunakan arsitektur terpisah antara **Backend (FastAPI)** dan **Frontend (React)**. Anda perlu menjalankan keduanya secara bersamaan di terminal terpisah.

### 1. Jalankan Backend (FastAPI)
Buka terminal baru di direktori utama `PixelVault`:
```bash
# 1. Masuk ke folder backend (opsional, jika ingin membuat virtual environment)
# python -m venv venv
# venv\Scripts\activate   # Untuk Windows

# 2. Instal semua dependensi python
pip install -r backend/requirements.txt

# 3. Jalankan server backend
python -m backend.main
```
> Backend sekarang berjalan di: **`http://localhost:8000`**

### 2. Jalankan Frontend (React + Vite)
Buka terminal kedua dan arahkan ke folder `frontend`:
```bash
# 1. Pindah ke direktori frontend
cd frontend

# 2. Instal semua dependensi npm
npm install

# 3. Jalankan server development
npm run dev
```
> Frontend sekarang berjalan di: **`http://localhost:5173`**

---

## 🌐 Akses Aplikasi
Setelah kedua server berjalan:
1. Buka browser favorit Anda.
2. Akses alamat **[http://localhost:5173](http://localhost:5173)**.
3. Anda siap mencoba fitur Kompresi & Steganografi untuk Gambar, Audio, dan Video!
