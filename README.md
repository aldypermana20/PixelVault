# 📄 Dokumen Rancangan Sistem Multimedia (REVISED)
## Judul Proyek: PixelVault - Web App Codec & Steganografi

---

**Mata Kuliah:** Sistem Multimedia  
**Kelompok:** [11]  
**Anggota Tim:**
| Nama | NIM | Peran |
|---|---|---|
| Aldy | [1237050003] | Perancang Sistem (*System Designer*) |
| Dapoy | [1237050069] | Pengembang Web (*Web Developer*) |
| Dwi | [1237050104] | Penyusun Laporan (*Documentation*) |


---

## Daftar Isi

1. [Latar Belakang & Tujuan](#1-latar-belakang--tujuan)
2. [Ruang Lingkup Sistem](#2-ruang-lingkup-sistem)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Spesifikasi Teknologi](#4-spesifikasi-teknologi)
5. [Algoritma & Teori Teknis](#5-algoritma--teori-teknis)
6. [Desain API Backend (FastAPI)](#6-desain-api-backend-fastapi)
7. [Desain Antarmuka Pengguna (Frontend React)](#7-desain-antarmuka-pengguna-frontend-react)
8. [Alur Data (Data Flow)](#8-alur-data-data-flow)
9. [Struktur Folder Proyek](#9-struktur-folder-proyek)
10. [Format Media yang Didukung](#10-format-media-yang-didukung)
11. [Rencana Pengujian Lengkap](#11-rencana-pengujian-lengkap)
12. [Pembagian Tugas & Timeline](#12-pembagian-tugas--timeline)
13. [Risiko & Mitigasi](#13-risiko--mitigasi)

---

## 1. Latar Belakang & Tujuan

### 1.1 Latar Belakang
Seiring perkembangan teknologi digital, kebutuhan akan penyimpanan dan transmisi data multimedia (gambar, audio, video) semakin meningkat. Data multimedia memiliki ukuran yang besar sehingga dibutuhkan teknik **kompresi** untuk mengefisiensikan penyimpanan. Di sisi lain, keamanan informasi juga semakin kritis, sehingga dibutuhkan teknik **steganografi** yaitu ilmu menyembunyikan pesan rahasia di dalam media digital secara tak kasat mata.

### 1.2 Tujuan Proyek
Meningkatkan pemahaman praktis mengenai pengolahan data biner multimedia melalui pengembangan sistem berbasis web yang mampu:
- Melakukan **kompresi & dekompresi** penuh pada tiga pilar media (gambar, audio, video) menggunakan kombinasi algoritma Huffman Coding, DCT, dan manipulasi bitstream struktural (FPS/Resolusi).
- Melakukan **penyisipan & ekstraksi pesan rahasia** (steganografi) pada level bit pada media gambar, audio, dan video.
- Menyediakan indikator dan metrik performa analitis (Rasio kompresi %, Nilai PSNR, Waktu Eksekusi, Ukuran Berkas) secara real-time.

---

## 2. Ruang Lingkup Sistem

### Yang Termasuk dalam Sistem (In Scope)
- Antarmuka web responsif berbasis browser (tidak memerlukan instalasi perangkat lunak tambahan oleh pengguna).
- **Modul Codec Gambar:** 
  - Kompresi & Dekompresi Gambar menggunakan algoritma **Huffman Coding** (*Lossless*) menghasilkan berkas kustom `.huff`.
  - Kompresi Gambar menggunakan algoritma **DCT** (*Lossy*) menghasilkan berkas gambar standar `.png` atau `.jpg` yang langsung terkonstruksi dari backend.
- **Modul Codec Audio:** Kompresi *Lossless* berbasis Huffman pada representasi array biner, serta metode *Downsampling* frekuensi (Lossy) untuk mereduksi sampling rate audio dengan library SciPy.
- **Modul Codec Video:** Kompresi *Lossy* melalui rekonstruksi struktural container video dengan manipulasi **Frame Rate (FPS)** dan **Skala Resolusi Spasial** menggunakan OpenCV.
- **Modul Steganografi (Lengkap):** 
  - Penyisipan & ekstraksi teks rahasia pada piksel **Gambar** (LSB substitusi warna RGBA).
  - Penyisipan & ekstraksi pada sampel amplitudo **Audio** PCM 16-bit berkas `.wav`.
  - Penyisipan & ekstraksi pada domain spasial frame spesifik di dalam berkas container **Video** `.avi`.
- Dokumentasi teknis terstruktur setara format Laporan Kerja Praktek (KP) dan Video Presentasi Demo Fungsional (Maksimal 15 Menit).

### Yang Tidak Termasuk (Out of Scope)
- Enkripsi kriptografi berlapis (AES, RSA) pada pesan sebelum disisipkan.
- Sistem manajemen basis data (Database) untuk riwayat berkas pengguna dan autentikasi login.
- Penanganan berkas raksasa di atas **25 MB** (pembatasan dilakukan demi menjaga kestabilan waktu tunggu/timeout pemrosesan HTTP saat demo).

---

## 3. Arsitektur Sistem

Sistem menggunakan arsitektur **Client-Server** terpisah secara modular:

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER PENGGUNA                          │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │            FRONTEND (React.js + Vite)                    │   │
│   │                                                          │   │
│   │   ┌────────────┐  ┌─────────────┐  ┌────────────────┐  │   │
│   │   │  Halaman   │  │  Halaman    │  │   Halaman      │  │   │
│   │   │  Kompresi  │  │ Steganografi│  │    Tentang     │  │   │
│   │   └────────────┘  └─────────────┘  └────────────────┘  │   │
│   └───────────────────────────┬──────────────────────────────┘   │
└───────────────────────────────│──────────────────────────────────┘
                                │ HTTP Request (multipart/form-data)
                                │ ◄──────── JSON Response + File Stream
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND (Python FastAPI)                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Router      │  │  Router      │  │  Router              │   │
│  │  /compress   │  │  /stego      │  │  /decompress         │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────────┘   │
│         │                 │                   │                  │
│         ▼                 ▼                   ▼                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   Core Processing Engine                   │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │   Huffman   │  │  DCT & Video │  │  LSB Steganografi │  │  │
│  │  │   Module    │  │  FPS Module  │  │  (IMG/AUD/VID)   │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │  │
│  │                                                            │  │
│  │    Library Core: NumPy | OpenCV | SciPy | Pillow | FFT     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │    Temporary File Storage (Folder /temp pada server)     │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Spesifikasi Teknologi

### 4.1 Frontend
- **Framework Utama:** React.js (^19) via Vite build tool.
- **Styling Engine:** TailwindCSS (^4) untuk antarmuka berwujud modern, bersih, dan mendukung dark mode bawaan.
- **Asynchronous HTTP Client:** Axios (^1) untuk menangani pengiriman payload biner berbentuk multipart form-data ke API.
- **Metrik Visualizer:** Recharts untuk menampilkan diagram perbandingan performa bit-reduction.
- **File Interactor:** React Dropzone (^15) untuk mempermudah alur drag-and-drop file multimedia.

### 4.2 Backend
- **Bahasa & Framework:** Python (^3.10) dengan FastAPI (^0.111).
- **Linear Algebra & Matrix Processing:** NumPy (^1.26) untuk manipulasi array piksel mentah dan pemrosesan bitwise.
- **Computer Vision Utilities:** OpenCV (`cv2` ^4.9) untuk pemrosesan gambar, pembacaan struktur, ekstraksi frame video, dan penulisan berkas kontainer video.
- **Audio I/O Handler:** SciPy (^1.13) untuk mengekstraksi amplitudo biner PCM dan memanipulasi sampling rate berkas `.wav`.
- **Image Core Manipulation:** Pillow (PIL ^10) untuk pengolahan konversi skema warna dasar gambar.

---

## 5. Algoritma & Teori Teknis

### 5.1 Huffman Coding (Lossless Image & Audio Byte Compression)
Algoritma kompresi berbasis statistik di mana simbol yang lebih sering muncul dalam sebuah aliran data biner akan dikodekan dengan bit penanda yang lebih pendek, sedangkan simbol yang jarang muncul akan dikodekan dengan bit yang lebih panjang. Pada modul ini, Huffman diterapkan langsung untuk memetakan frekuensi sebaran kemunculan intensitas piksel warna gambar atau byte amplitudo audio mentah.

### 5.2 Discrete Cosine Transform (Lossy Image Compression - Sequential Output PNG/JPG)
DCT memindahkan informasi citra digital dari domain spasial (piksel) menuju domain frekuensi. Komponen frekuensi tinggi (detail tajam yang tidak terlalu disadari oleh mata manusia) akan dipangkas lewat matriks kuantisasi standar JPEG.

**Rumus DCT 2D:**

$$F(u,v) = \frac{1}{4} C(u)C(v) \sum_{x=0}^{7} \sum_{y=0}^{7} f(x,y) \cos\left[\frac{(2x+1)u\pi}{16}\right] \cos\left[\frac{(2y+1)v\pi}{16}\right]$$

Proses ini menghasilkan nilai nol yang masif pada matriks frekuensi. Pada modul ini, setelah proses kompresi (DCT & kuantisasi dengan matriks Q) selesai, backend akan langsung melakukan rekonstruksi balik menggunakan IDCT (Inverse DCT) secara sekuensial:

$$\hat{f}(x,y) = \frac{1}{4} \sum_{u=0}^{7} \sum_{v=0}^{7} C(u)C(v) F(u,v) \cos\left[\frac{(2x+1)u\pi}{16}\right] \cos\left[\frac{(2y+1)v\pi}{16}\right]$$

Gambar hasil rekonstruksi langsung dikonversi kembali ke ruang warna RGB dan disimpan sebagai berkas gambar standar berformat **`.png`** atau **`.jpg`**. Hal ini memungkinkan berkas terkompresi langsung dibuka di aplikasi peninjau gambar bawaan sistem operasi (Windows Photo Viewer, Android Gallery) dan langsung ditampilkan secara *side-by-side* di Frontend React tanpa perlu dekompresi manual lagi di web.

### 5.3 Video Structural Codec (Lossy Video Compression)
Mengingat tingginya kompleksitas kompresi inter-frame murni dari nol, modul video menggunakan teknik **Structural Reconstruction** berbasis OpenCV.
- **Kompresi Temporal (FPS Reduction):** Memotong jumlah frame per detik (misalnya menurunkan video dari 30 FPS menjadi 15 FPS dengan membuang frame pada indeks tertentu secara matematis).
- **Kompresi Spasial (Spatial Scaling):** Mengubah resolusi piksel tiap frame gambar (misalnya memperkecil dimensi lebar $\times$ tinggi sebesar 50%).
Frame yang tersisa dijahit kembali ke wadah berkas kontainer `.avi` baru menggunakan codec standar seperti **XVID** atau **MJPEG** di sisi backend.

### 5.4 LSB (Least Significant Bit) Steganografi
Metode penyembunyian teks rahasia dengan cara mengganti bit paling belakang (paling kanan / tidak signifikan) pada array biner media pembawa (*cover media*). Perubahan nilai bit paling kanan ini hanya mengubah nilai desimal sebesar maksimal 1 angka, sehingga tidak mendatangkan distorsi visual ataupun audio yang dapat ditangkap oleh indra manusia.
- **Gambar LSB:** Mengubah bit biner paling kanan pada matriks warna `R`, `G`, atau `B`.
- **Audio LSB:** Mengubah bit biner paling kanan pada array amplitudo suara PCM linear berkas `.wav` 16-bit.
- **Video LSB:** Sistem akan melompat secara spesifik ke indeks frame tertentu yang dipilih pengguna (misal frame ke-10), mengekstrak frame tersebut sebagai gambar spasial, lalu menyisipkan bit pesan ke dalam piksel frame tersebut menggunakan LSB gambar, sebelum dijahit kembali menjadi video kontainer `.avi` utuh.

---

## 6. Desain API Backend (FastAPI)

**Base URL:** `http://localhost:8000/api`

### 6.1 Endpoint Kompresi & Dekompresi

| Method | Endpoint | Deskripsi | Input Payload (Multipart/Form-Data) | Output File |
|---|---|---|---|---|
| POST | `/compress/huffman` | Kompresi gambar/audio lewat Huffman | `file` (PNG/BMP/WAV) | `.huff` (Biner Kustom) |
| POST | `/decompress/huffman` | Dekompresi file biner Huffman | `file` (`.huff`) | `.png` / `.wav` (Asli) |
| POST | `/compress/dct` | Kompresi gambar lewat skema DCT | `file` (PNG/BMP), `quality` (int 1-100) | `.png` (Gambar Standar) |
| POST | `/decompress/dct` | Dekompresi file matriks DCT (Internal) | `file` (`.dct`) | `.png` (Gambar Standar) |
| POST | `/compress/audio` | Kompresi Audio (Huffman / Downsample) | `file` (WAV), `mode` (string: lossless/lossy) | `.huff` / `.wav` (PCM 16-bit) |
| POST | `/decompress/audio` | Dekompresi berkas audio WAV | `file` (WAV hasil kompresi / `.huff`) | `.wav` (Audio Standar) |
| POST | `/compress/video` | Kompresi Video (FPS & Skala) | `file` (AVI), `target_fps` (int), `scale` (float) | `.avi` (Codec MJPG/XVID) |
| POST | `/decompress/video` | Rekonstruksi struktur kontainer video | `file` (AVI hasil kompresi) | `.avi` (Video Standar) |

### 6.2 Endpoint Steganografi

| Method | Endpoint | Deskripsi | Input Payload (Multipart/Form-Data) |
|---|---|---|---|
| POST | `/stego/image/encode` | Menyisipkan pesan teks ke dalam gambar | `file` (PNG), `message` (string) |
| POST | `/stego/image/decode` | Ekstrak teks dari gambar stego | `file` (PNG hasil encode) |
| POST | `/stego/audio/encode` | Menyisipkan pesan teks ke dalam audio | `file` (WAV), `message` (string) |
| POST | `/stego/audio/decode` | Ekstrak teks dari audio stego | `file` (WAV hasil encode) |
| POST | `/stego/video/encode` | Menyisipkan pesan ke frame video | `file` (AVI), `message` (string), `frame_index` (int) |
| POST | `/stego/video/decode` | Ekstrak teks dari frame video stego | `file` (AVI hasil encode), `frame_index` (int) |

---

## 7. Desain Antarmuka Pengguna (Frontend React)

### 7.1 Halaman Utama & Navigasi
```
/                   → Landing Page (Pengenalan Aplikasi & Fitur)
/compress           → Dashboard Manajemen Codec (Gambar / Audio / Video)
/steganography      → Dashboard Operasi Stego (Encode / Decode)
/about              → Profil Anggota Tim & Detail Dasar Teori Algoritma
```

### 7.2 Struktur Panel Antarmuka Modul Terpadu (Sub-Tabs Control)
Untuk mengakomodasi tambahan fitur video dan audio tanpa membuat UI berantakan, halaman `/compress` dan `/steganography` menggunakan komponen **Sub-Tabs Control** terpadu. Pengguna cukup menekan tombol kategori media (Gambar / Audio / Video) untuk memunculkan instruksi input yang sesuai secara dinamis:

*   **Tab Gambar:** Menampilkan konfigurasi parameter Huffman/DCT, slider faktor kualitas (Q), area dropzone gambar, dan visualisasi perbandingan *side-by-side*.
*   **Tab Audio:** Menampilkan pilihan mode kompresi (Lossless/Lossy), area dropzone audio `.wav`, dan pemutar audio HTML5 bawaan.
*   **Tab Video:** Menampilkan konfigurasi parameter Skala Spasial (10%-100%), pilihan Target FPS (10, 15, 24, 30 FPS), area dropzone video `.avi`, serta informasi teknis dan tautan unduhan.

---

## 8. Alur Data (Data Flow)

### 8.1 Alur Kompresi Gambar DCT (Lossy - Output Gambar Standar)
```
User Upload PNG/BMP
       │
       ▼
FastAPI menerima berkas citra
       │
       ▼
Konversi RGB ke YCbCr & Pembagian Blok 8x8
       │
       ▼
Penghitungan DCT & Kuantisasi Blok (Matriks Q)
       │
       ▼
Rekonstruksi Balik secara Sekuensial di Backend (IDCT & Konversi RGB)
       │
       ▼
Penyimpanan Berkas sebagai PNG/JPG Baru
       │
       ▼
Kirim Berkas Gambar PNG/JPG Kecil langsung ke Frontend (untuk pratinjau & unduh)
```

### 8.2 Alur Kompresi Video Struktural (Lossy)
```
User Mengunggah Video (.avi) + Mengatur Parameter Target FPS & Skala Dimensi
       │
       ▼
FastAPI Membaca Berkas Stream & Membuka Kontainer via cv2.VideoCapture()
       │
       ▼
Looping Frame Terpilih (Sesuai Pengurangan FPS)
       │
       ▼
Lakukan Redimensi Citra Spasial (cv2.resize) pada Frame Terpilih
       │
       ▼
Tulis ke Kontainer Baru Menggunakan cv2.VideoWriter() (XVID/MJPEG Codec)
       │
       ▼
Hitung Selisih Ukuran Berkas Akhir, Rata-rata PSNR, & Catat Waktu Eksekusi
       │
       ▼
Kirim JSON Response Berisi Tautan Unduh Berkas AVI
```

---

## 9. Struktur Folder Proyek

```
multimedia-codec-project/
│
├── backend/                        # Python FastAPI Engine
│   ├── main.py                     # Entry point & Penanganan Aturan CORS
│   ├── requirements.txt            # Dependensi Package Python
│   ├── routers/
│   │   ├── compress_router.py      # Routing Endpoint Kompresi & Dekompresi
│   │   └── stego_router.py         # Routing Endpoint Operasi Steganografi
│   ├── services/
│   │   ├── huffman.py              # Engine Algoritma Huffman
│   │   ├── dct.py                  # Engine Algoritma DCT Gambar
│   │   ├── video_codec.py          # Engine Manipulator Struktural Video (FPS/Scale)
│   │   ├── audio_codec.py          # Engine Downsampling Audio (Lossy)
│   │   └── lsb.py                  # Core Steganografi Bitwise (IMG, AUD, VID)
│   ├── utils/
│   │   ├── file_handler.py         # Pengelola Upload File & Auto-Clean Temp
│   │   └── metrics.py              # Math Calculator (PSNR, MSE, Ratio)
│   └── temp/                       # Direktori File Sementara Server
│
└── frontend/                       # React + Vite Client Application
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx                 # Central App Routing Layout
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── CompressPage.jsx    # Dashboard Kontrol Codec (Sub-Tabs)
    │   │   ├── StegoPage.jsx       # Dashboard Kontrol Steganografi (Sub-Tabs)
    │   │   └── AboutPage.jsx
    │   ├── components/
    │   │   └── Navbar.jsx
    │   └── services/
    │       └── api.js              # Penanganan API call menggunakan Axios
```

---

## 10. Format Media yang Didukung (WAJIB DIPATUHI)

| Kategori Modul | Jenis Media | Format Input | Format Output | Catatan Teknis Penting |
|---|---|---|---|---|
| **Codec Huffman** | Gambar | `.png`, `.bmp` | `.huff` | Kompresi murni biner tanpa cacat (*Lossless*) |
| **Codec DCT** | Gambar | `.png`, `.bmp` | `.png`, `.jpg` | Kompresi lossy domain frekuensi, output berupa gambar standar |
| **Codec Audio** | Audio | `.wav` | `.huff` / `.wav` | Mendukung Huffman (*Lossless*) dan Downsampling (*Lossy*) |
| **Structural Codec**| Video | `.avi` | `.avi` | Kompresi temporal (FPS) & spasial (Scale) via OpenCV |
| **LSB Stego** | Gambar | `.png` | `.png` | Dilarang output JPG (karena kompresi lossy merusak bit LSB) |
| **LSB Stego** | Audio | `.wav` | `.wav` | Wajib menggunakan berkas WAV uncompressed PCM 16-bit |
| **LSB Stego** | Video | `.avi` | `.avi` | Format RAW uncompressed kontainer AVI |

---

## 11. Rencana Pengujian Lengkap

### 11.1 Matriks Kasus Uji Fungsional Sistem Terintegrasi

| ID Uji | Modul Utama | Skenario Spesifikasi Uji | Berkas Input | Ekspektasi Perilaku Sistem |
|---|---|---|---|---|
| **TC-01** | Codec Gambar | Kompresi citra digital via Huffman | `test_img.png` | Berkas `.huff` terunduh, rasio ukuran menyusut. |
| **TC-02** | Codec Gambar | Dekompresi berkas hasil Huffman | `test_img.huff` | Rekonstruksi citra utuh dengan nilai PSNR tak terhingga (*bit-perfect*). |
| **TC-03** | Codec Gambar | Kompresi citra digital via DCT | `test_img.png` | Berkas gambar standar `.png` sukses diproduksi dengan penurunan ukuran file. |
| **TC-04** | Codec Video | Kompresi Video via Frame Drop & Scaling | `test_vid.avi` | Video terkompresi dengan resolusi lebih kecil, FPS turun, ukuran bitstream mengecil. |
| **TC-05** | Stego Gambar | Penyisipan Pesan Teks LSB | `cover.png` + "RAHASIA" | Citra stego PNG terunduh, identik dengan aslinya di mata manusia. |
| **TC-06** | Stego Gambar | Ekstraksi Pesan Teks LSB | `stego_img.png` | String tulisan "RAHASIA" berhasil dimunculkan kembali. |
| **TC-07** | Stego Audio | Penyisipan Pesan Teks LSB | `audio.wav` + "CONFIDENTIAL"| Berkas `.wav` terunduh tanpa ada gangguan noise bising yang kentara. |
| **TC-08** | Stego Audio | Ekstraksi Pesan Teks LSB | `stego_aud.wav` | String tulisan "CONFIDENTIAL" berhasil terbaca utuh. |
| **TC-09** | Stego Video | Penyisipan Teks LSB pada Frame Terpilih | `video.avi` + "FRAME10", idx=10 | Berkas kontainer `.avi` sukses diproduksi menggunakan OpenCV. |
| **TC-10** | Stego Video | Ekstraksi Teks dari Frame Terpilih (Sukses) | `stego_vid.avi`, idx=10 | String "FRAME10" terekstrak dengan sukses. |
| **TC-11** | Stego Video | Ekstraksi Teks (Salah Indeks Frame) | `stego_vid.avi`, idx=3 | Pesan gagal terbaca / menghasilkan karakter acak (Error Handler). |
| **TC-12** | Error Handler | Ukuran berkas melebihi batasan maksimum | Berkas ukuran 45MB | API memblokir pengunggahan dan melempar Error HTTP 400 Bad Request. |

---

## 12. Pembagian Tugas & Timeline (3 Minggu Kerja)

### Distribusi Beban Anggota Kelompok
*   **Aldy (System Designer):** Bertanggung jawab atas ketersediaan aset berkas uji sampel standar (Gambar, Audio `.wav`, Video `.avi`). Mengendalikan tinjauan kode program (*code review*) dan melakukan komparasi kualitas metrik pengujian sebelum presentasi.
*   **Dapoy (Core Developer):** Melaksanakan inisialisasi lingkungan pengkodean repository, menulis fungsi-fungsi core pemrosesan multimedia backend di folder `services/`, merancang routing API endpoint FastAPI, membangun antarmuka frontend React (Sub-Tabs Control), serta melakukan proses wiring integrasi API via Axios.
*   **Dwi (Documentation Lead):** Bertanggung jawab mutlak menyusun draf Laporan Akhir sesuai pakem template Kerja Praktek secara bertahap (Bab I s.d Bab V), mengambil dokumentasi tangkapan layar antarmuka sistem, dan menyusun teks panduan presentasi video demo.

---

## 13. Risiko & Mitigasi Pengkodean

*   **Risiko 1: Kerusakan Bit LSB Audio/Video akibat Auto-compression Codec.**
    *   *Mitigasi:* Backend diset secara ketat untuk menolak ekstensi berkas lossy bawaan seperti `.mp3` atau `.mp4`. Seluruh operasi steganografi wajib dialokasikan pada berkas biner murni mentah (`.wav` uncompressed dan kontainer `.avi` mentah tanpa interframe compression).
*   **Risiko 2: Masalah Hambatan Akses Lintas Asal (CORS Error) antara React dan FastAPI.**
    *   *Mitigasi:* Menyisipkan konfigurasi `CORSMiddleware` di file `main.py` milik FastAPI dengan membuka parameter `allow_origins=["*"]` sepanjang fase pengembangan aplikasi lokal dijalankan.
*   **Risiko 3: Memori RAM Server Penuh (OOM) akibat Pemrosesan Array Matriks Video.**
    *   *Mitigasi:* Sistem tidak memuat seluruh frame video sekaligus ke memori RAM, melainkan memanfaatkan generator pemrosesan sekuensial per frame tunggal memanfaatkan siklus baca-tulis internal OpenCV.
