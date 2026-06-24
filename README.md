# 📄 Dokumen Rancangan Sistem Multimedia
## Judul Proyek: PixelVault - Web App Codec & Steganografi

---

**Mata Kuliah:** Sistem Multimedia  
**Kelompok:** 11
**Anggota Tim:**
| Nama | NIM | Peran |
|---|---|---|
| Aldy | [1237050003] | Perancang Sistem (*System Designer*) |
| Dhaffa | [1237050069] | Pengembang Web (*Web Developer*) |
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

---

## 1. Latar Belakang & Tujuan

### 1.1 Latar Belakang
Seiring perkembangan teknologi digital, kebutuhan akan penyimpanan dan transmisi data multimedia (gambar, audio, video) semakin meningkat. Data multimedia memiliki ukuran yang besar sehingga dibutuhkan teknik **kompresi** untuk mengefisiensikan penyimpanan. Di sisi lain, keamanan informasi juga semakin kritis, sehingga dibutuhkan teknik **steganografi** yaitu ilmu menyembunyikan pesan rahasia di dalam media digital secara tak kasat mata.

### 1.2 Tujuan Proyek
Meningkatkan pemahaman praktis mengenai pengolahan data biner multimedia melalui pengembangan sistem berbasis web yang mampu:
- Melakukan **kompresi & dekompresi** penuh pada tiga jenis media (gambar, audio, video) secara lossless menggunakan algoritma **Huffman Coding**.
- Melakukan **penyisipan & ekstraksi pesan rahasia** (steganografi) pada level bit menggunakan metode **Least Significant Bit (LSB)** pada media gambar, audio, dan video.
- Menyediakan informasi performa ukuran file hasil kompresi secara real-time.

---

## 2. Ruang Lingkup Sistem

### Yang Termasuk dalam Sistem (In Scope)
- Antarmuka web responsif berbasis browser (tidak memerlukan instalasi perangkat lunak tambahan oleh pengguna).
- **Modul Codec Multimedia:** 
  - Kompresi & Dekompresi Gambar, Audio, dan Video secara utuh (Lossless) berbasis algoritma **Huffman Coding**. Output file kompresi akan berupa representasi binary dengan format kustom `.huff` atau `.huf`.
- **Modul Steganografi:** 
  - Penyisipan & ekstraksi teks rahasia pada struktur bit data **Gambar**, **Audio**, dan **Video** menggunakan metode integrasi **LSB (Least Significant Bit)**.

### Yang Tidak Termasuk (Out of Scope)
- Algoritma kompresi lossy seperti DCT (Discrete Cosine Transform) pada gambar atau manipulasi Frame Rate / Scaling dimensi pada video.
- Enkripsi kriptografi berlapis (AES, RSA) pada pesan sebelum disisipkan.
- Sistem manajemen basis data (Database) untuk riwayat berkas pengguna dan autentikasi login (hanya tracking data sederhana berbasis JSON file).
- Penanganan berkas berukuran raksasa. Disarankan mencoba dengan file di bawah **25 MB** agar stabilitas pemrosesan backend terjaga.

---

## 3. Arsitektur Sistem

Sistem menggunakan arsitektur **Client-Server** terpisah secara modular:

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER PENGGUNA                          │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │            FRONTEND (React.js + Vite)                    │   │
│   └───────────────────────────┬──────────────────────────────┘   │
└───────────────────────────────│──────────────────────────────────┘
                                │ HTTP Request (multipart/form-data)
                                │ ◄──────── JSON Response + File URL
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND (Python FastAPI)                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Router      │  │  Router      │  │  Router              │   │
│  │  Image       │  │  Audio       │  │  Video / Stego       │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────────┘   │
│         │                 │                   │                  │
│         ▼                 ▼                   ▼                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   Core Processing Engine                   │  │
│  │                                                            │  │
│  │  ┌────────────────────┐      ┌──────────────────────────┐  │  │
│  │  │   Huffman Codec    │      │    LSB Steganografi      │  │  │
│  │  │  (IMG, AUD, VID)   │      │     (IMG, AUD, VID)      │  │  │
│  │  └────────────────────┘      └──────────────────────────┘  │  │
│  │                                                            │  │
│  │    Library Core: NumPy | OpenCV | FastAPI UploadFile       │  │
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
- **Framework Utama:** React.js via Vite build tool.
- **Styling Engine:** TailwindCSS untuk antarmuka berwujud modern dan bersih.
- **Asynchronous HTTP Client:** Axios untuk menangani pengiriman payload biner berbentuk multipart form-data ke API FastAPI.

### 4.2 Backend
- **Bahasa & Framework:** Python dengan FastAPI.
- **Data Manipulation:** NumPy & OpenCV (`cv2`) untuk pembacaan struktur dasar gambar/frame.
- **Processing Core:** Algoritma natif Python menggunakan manipulasi heap (`heapq`) dan bitwise untuk struktur Huffman Tree dan penyisipan data pada level bit LSB.

---

## 5. Algoritma & Teori Teknis

### 5.1 Huffman Coding (Lossless Compression)
Algoritma kompresi lossless berbasis statistik di mana simbol (atau byte) yang lebih sering muncul dalam sebuah aliran data akan dikodekan dengan bit penanda yang lebih pendek, sedangkan simbol yang jarang muncul akan dikodekan dengan bit yang lebih panjang. 

Pada sistem PixelVault, Huffman diimplementasikan secara global. Matriks biner yang diekstrak dari gambar (Piksel RGB) atau raw data byte dari Audio / Video dikompres menggunakan tree frekuensi Huffman, dan hasilnya disimpan dalam berkas biner spesifik `.huff` / `.huf`. Saat didekompres, *Huffman Tree* dibangun ulang berdasar kamus *frequency* yang disematkan dalam file untuk merekonstruksi media aslinya secara *bit-perfect*.

### 5.2 LSB (Least Significant Bit) Steganografi
Metode penyembunyian teks rahasia dengan cara mengganti bit paling belakang (paling kanan / tidak signifikan) pada array biner media pembawa (*cover media*). Perubahan nilai bit paling kanan ini hanya mengubah nilai desimal sebesar maksimal 1 angka, sehingga distorsi visual ataupun audio yang terjadi hampir tidak terlihat secara kasat mata atau terdengar.
- **Gambar:** Teks dikonversi ke binary bitstream, lalu dimasukkan pada bit terakhir piksel gambar (BGR array) pada setiap channel secara runtut.
- **Audio & Video:** Pesan dikonversi menjadi representasi biner dan kemudian disuntikkan secara sekuensial pada representasi raw audio dan raw buffer stream frame video menggunakan metode pengubahan index byte paling terakhir secara halus.

---

## 6. Desain API Backend (FastAPI)

**Base URL:** `http://localhost:8000/api`

### 6.1 Endpoint Kompresi & Dekompresi (Huffman)

| Method | Endpoint | Deskripsi | Input Form |
|---|---|---|---|
| POST | `/image/compress` | Kompresi gambar via Huffman | `file` (PNG/JPG) |
| POST | `/image/decompress` | Dekompresi berkas hasil Huffman gambar | `file` (`.huff`) |
| POST | `/audio/compress` | Kompresi audio via Huffman | `file` (WAV/MP3) |
| POST | `/audio/decompress` | Dekompresi berkas hasil Huffman audio | `file` (`.huf`) |
| POST | `/video/compress` | Kompresi video via Huffman | `file` (AVI/MP4) |
| POST | `/video/decompress` | Dekompresi berkas hasil Huffman video | `file` (`.huf`) |

### 6.2 Endpoint Steganografi (LSB)

| Method | Endpoint | Deskripsi | Input Form |
|---|---|---|---|
| POST | `/stego/image/embed` | Sisipkan teks ke gambar | `file` (Img), `secret_message` (String) |
| POST | `/stego/image/extract`| Ekstrak teks dari gambar stego | `file` (Img Stego) |
| POST | `/stego/audio/embed` | Sisipkan teks ke audio | `file` (Audio), `secret_message` (String) |
| POST | `/stego/audio/extract`| Ekstrak teks dari audio stego | `file` (Audio Stego) |
| POST | `/stego/video/embed` | Sisipkan teks ke video | `file` (Video), `secret_message` (String) |
| POST | `/stego/video/extract`| Ekstrak teks dari video stego | `file` (Video Stego) |

*(Setiap endpoint mengembalikan JSON berisi informasi file serta tautan `download_url`).*

---

## 7. Desain Antarmuka Pengguna (Frontend React)

Aplikasi dibangun menggunakan Single Page Application yang memiliki integrasi tab komponen dinamis, misalnya:
- **Dashboard Codec (Kompresi & Dekompresi):** Panel untuk upload file multimedia dengan dropdown yang secara spesifik menampilkan hasil rasio kompresi, ukuran awal vs akhir.
- **Dashboard Steganografi:** Panel input ganda berisi fungsi _Embed_ (Memasukkan Pesan) dan _Extract_ (Mengeluarkan Pesan) untuk semua format media (Gambar, Audio, dan Video).

---

## 8. Alur Data (Data Flow)

**Alur Kompresi Standar Huffman:**
```
User Upload File (Gambar/Audio/Video) via UI Drag-and-Drop
       │
       ▼
Payload Multipart dikirim ke FastAPI Backend (Sesuai Tipe Media)
       │
       ▼
Algoritma Huffman Membaca Byte stream:
 1. Menghitung Frequency Dictionary
 2. Membangun Huffman Tree
 3. Konversi Data Byte menjadi Bitstream Pendek Berdasarkan Tree
       │
       ▼
Dictionary, Jumlah Padding, dan Data Biner dipaket (Pickle) menjadi berkas '.huf'
       │
       ▼
JSON Response ke Frontend berisi Ukuran Original, Ukuran Baru, dan URL Download File Kompresi
```

---

## 9. Struktur Folder Proyek

```
PixelVault/
│
├── backend/                        # Python FastAPI Engine
│   ├── main.py                     # Entry point & Penanganan Aturan CORS
│   ├── requirements.txt            # Dependensi Package Python
│   ├── api/
│   │   └── routers/                # Routing API Terpisah
│   │       ├── image.py            # Route Codec Gambar
│   │       ├── audio.py            # Route Codec Audio
│   │       ├── video.py            # Route Codec Video
│   │       └── stego.py            # Route Steganografi Gabungan
│   ├── services/
│   │   ├── codec/
│   │   │   ├── huffman.py          # Engine Algoritma Kompresi Huffman
│   │   │   └── rle.py              # Engine RLE (Experimental)
│   │   └── steganography/
│   │       ├── lsb_image.py        # Core LSB Steganografi Gambar
│   │       ├── lsb_audio.py        # Core LSB Steganografi Audio
│   │       └── lsb_video.py        # Core LSB Steganografi Video
│   ├── utils/
│   │   └── file_utils.py           # Pengelola Upload File & Path Temp
│   └── temp/                       # Direktori File Sementara
│
└── frontend/                       # React + Vite Client Application
    ├── src/
    │   ├── App.jsx                 # Routing Layout
    │   ├── components/             # React Komponen UI Utama
    │   ├── pages/                  # Landing, Compress, dan Stego Page
    │   └── services/
    │       └── api.js              # Interceptor Axios API
    ├── package.json
    └── vite.config.js
```

---

## 10. Format Media yang Didukung

## 10. Panduan Format Media & Batasan Input Sistem

Agar proses dalam aplikasi dapat berjalan lancar tanpa mengalami eror atau korupsi data (*data corruption*), ada beberapa aturan ketat mengenai jenis file yang **BISA** dan **TIDAK BISA** dimasukkan.

### 10.1. Modul Kompresi (Huffman Codec)
Karena algoritma Huffman diimplementasikan untuk memanipulasi dan memadatkan urutan bit *raw* (secara _lossless_), pada dasarnya algoritma ini tahan terhadap format yang dimasukkan selama itu binary. Namun, demi stabilitas dekompresi:
*   **BISA:** File standar seperti `.png`, `.jpg`, `.bmp` (untuk gambar), `.wav`, `.mp3` (untuk audio), dan `.avi`, `.mp4` (untuk video).
*   **BATASAN UKURAN:** Disarankan maksimal **25 MB**.
*   **ALASAN:** Pemrosesan pohon Huffman pada backend memuat seluruh data stream biner ke dalam RAM (`heapq`). Jika file terlalu raksasa (misal 1 GB), maka backend akan mengalami *Out of Memory* (OOM) atau *timeout* saat mengirim balik *response* ke frontend.

> [!CAUTION]
> **Peringatan *Negative Compression* (Pembengkakan Ukuran Ukuran File):**
> Jika Anda memasukkan file yang pada dasarnya **sudah memiliki kompresi bawaan yang tinggi** (seperti `.png`, `.jpg`, `.mp4`, atau `.mp3`), file keluaran `.huff` kemungkinan besar akan **lebih besar (membengkak)** daripada file aslinya. 
> 
> *   **Kasus Gambar (`.png`/`.jpg`):** Sistem `cv2` akan membongkar (decode) gambar menjadi matriks warna *raw BGR* sebelum dihitung Huffman-nya. Karena format PNG sudah punya kompresi internal yang berlapis (DEFLATE / LZ77 + Huffman), mengkompres ulang matriks *raw*-nya dengan Huffman tunggal tentu kalah efisien dan membuat ukuran menjadi besar.
> *   **Kasus Audio/Video (`.mp3`/`.mp4`):** File terkompresi memiliki entropi data yang sangat tinggi (acak/sedikit redundansi). Menerapkan Huffman pada data ber-entropi tinggi justru akan merugikan karena sistem harus menyimpan tambahan ukuran kamus/tree (*dictionary overhead*).
> *   **Rekomendasi Uji Coba Ideal:** Untuk benar-benar melihat cara kerja dan performa penyusutan algoritma Huffman di aplikasi ini, ujilah menggunakan format _raw uncompressed_ seperti **`.bmp`** untuk gambar, atau **`.wav`** PCM murni untuk audio.

### 10.2. Modul Steganografi (LSB)
Metode LSB menyisipkan pesan pada bit terakhir (ke-8) dari struktur pembentuk media (seperti matrix RGB piksel atau amplitudo PCM audio). Metode ini **sangat rentan terhadap kompresi Lossy**.

| Jenis Media | Format yang BISA (Dianjurkan) | Format yang TIDAK BISA (Dilarang) | Alasan Teknis |
|---|---|---|---|
| **Gambar** | `.png`, `.bmp` | `.jpg`, `.jpeg`, `.webp` | Format `.jpg` menggunakan kompresi *Lossy* (DCT). Ketika gambar stego disimpan sebagai JPG, kompresi algoritmanya akan merombak susunan blok matriks piksel warna sehingga bit LSB rahasia otomatis ikut hancur dan tidak dapat diekstrak. Format PNG dan BMP bersifat *Lossless* (piksel tidak berubah). |
| **Audio** | `.wav` (PCM 16-bit uncompressed) | `.mp3`, `.aac`, `.ogg` | Modul pembaca audio di sistem (`wave` library) mewajibkan format WAV. Selain itu, format MP3 memotong frekuensi suara menggunakan psikoakustik (*Lossy*), yang akan merubah bentuk sinyal amplitudo awal sehingga memusnahkan bit LSB pesan rahasia. |
| **Video** | `.avi` (Raw/Lossless Codec) | `.mp4` (H.264), `.mkv` | Video MP4 (dengan codec H.264/H.265) melakukan prediksi dan kompresi antar-*frame* (*Inter-frame compression*). Kompresi ini akan mengubah nilai piksel pada frame-frame untuk menekan ukuran. Backend `cv2` sistem ini mensyaratkan `.avi` dan secara internal mengkodekan ulang output dengan codec Lossless (HFYU) agar pesan LSB tiap frame tidak terbuang. |

> [!WARNING]
> **Kapasitas Payload Pesan:** Pastikan jumlah teks pesan rahasia yang dimasukkan tidak melebihi kapasitas panjang file *cover* medianya (Jumlah Piksel x 3 Channel untuk gambar, atau total frame amplitude pada audio). Jika pesan lebih panjang daripada kapastias LSB medianya, sistem akan menolak penyisipan.
