# 📄 Dokumen Rancangan Sistem Multimedia
## Judul Proyek: Web App Codec & Steganografi (Kompresi, Dekompresi, dan Penyembunyian Pesan Rahasia)

---

**Mata Kuliah:** Sistem Multimedia  
**Kelompok:** [Nama Kelompok]  
**Anggota Tim:**
| Nama | NIM | Peran |
|---|---|---|
| Aldy | [NIM] | Perancang Sistem (*System Designer*) |
| Dapoy | [NIM] | Pengembang Web (*Web Developer*) |
| Dwi | [NIM] | Penyusun Laporan (*Documentation*) |

**Versi Dokumen:** 1.0  
**Tanggal Dibuat:** 23 Juni 2026

---

## Daftar Isi

1. [Latar Belakang & Tujuan](#1-latar-belakang--tujuan)
2. [Ruang Lingkup Sistem](#2-ruang-lingkup-sistem)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Spesifikasi Teknologi](#4-spesifikasi-teknologi)
5. [Algoritma & Teori](#5-algoritma--teori)
6. [Desain API Backend (FastAPI)](#6-desain-api-backend-fastapi)
7. [Desain Antarmuka Pengguna (Frontend React)](#7-desain-antarmuka-pengguna-frontend-react)
8. [Alur Data (Data Flow)](#8-alur-data-data-flow)
9. [Struktur Folder Proyek](#9-struktur-folder-proyek)
10. [Format Media yang Didukung](#10-format-media-yang-didukung)
11. [Rencana Pengujian](#11-rencana-pengujian)
12. [Pembagian Tugas & Timeline](#12-pembagian-tugas--timeline)
13. [Risiko & Mitigasi](#13-risiko--mitigasi)

---

## 1. Latar Belakang & Tujuan

### 1.1 Latar Belakang
Seiring perkembangan teknologi digital, kebutuhan akan penyimpanan dan transmisi data multimedia (gambar, audio, video) semakin meningkat. Data multimedia memiliki ukuran yang besar sehingga dibutuhkan teknik **kompresi** untuk mengefisiensikan penyimpanan. Di sisi lain, keamanan informasi juga semakin kritis, sehingga dibutuhkan teknik **steganografi** — yaitu ilmu menyembunyikan pesan rahasia di dalam media digital secara tak kasat mata.

### 1.2 Tujuan Proyek
Membangun sebuah sistem berbasis web yang mampu:
- Melakukan **kompresi & dekompresi** file media (gambar, audio, video) menggunakan algoritma Huffman Coding dan DCT.
- Melakukan **penyisipan & ekstraksi pesan rahasia** pada file media menggunakan metode LSB (Least Significant Bit) Steganografi.
- Menampilkan **metrik hasil** secara real-time (ukuran file sebelum & sesudah, rasio kompresi, PSNR, waktu eksekusi).

### 1.3 Manfaat
- Memahami implementasi algorima codec secara langsung melalui visualisasi web.
- Mahasiswa dapat mengeksplor konsep kompresi *lossless* vs *lossy* secara praktis.
- Menjadi portofolio proyek yang nyata bagi seluruh anggota tim.

---

## 2. Ruang Lingkup Sistem

### Yang Termasuk dalam Sistem (In Scope)
- Antarmuka web berbasis browser (tidak perlu instalasi apapun oleh pengguna).
- Kompresi & Dekompresi gambar menggunakan **Huffman Coding**.
- Kompresi gambar menggunakan **DCT (Discrete Cosine Transform)**.
- Steganografi LSB untuk **Gambar**, **Audio**, dan **Video**.
- Tampilan metrik perbandingan (ukuran file, kualitas, waktu eksekusi).
- Dukungan untuk download hasil pemrosesan.

### Yang Tidak Termasuk (Out of Scope)
- Enkripsi kriptografi (AES, RSA) pada pesan rahasia.
- Autentikasi pengguna (Login/Register).
- Penyimpanan riwayat file di database.
- Pemrosesan file berukuran lebih dari **50 MB** (untuk menjaga performa demo).

---

## 3. Arsitektur Sistem

Sistem menggunakan arsitektur **Client-Server** dengan pemisahan yang jelas antara Frontend dan Backend:

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
                                │ ◄──────── JSON Response
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
│  │  │   Huffman   │  │     DCT     │  │  LSB Steganografi │  │  │
│  │  │   Module    │  │   Module    │  │    Module         │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │  │
│  │                                                            │  │
│  │            Library: NumPy | OpenCV | SciPy                │  │
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
| Teknologi | Versi | Kegunaan |
|---|---|---|
| React.js | ^18 | Framework UI utama |
| Vite | ^5 | Build tool & dev server |
| TailwindCSS | ^3 | Styling & layout yang modern |
| Axios | ^1 | HTTP client untuk komunikasi ke API |
| React Router | ^6 | Navigasi antar halaman |
| Recharts / Chart.js | ^2 | Visualisasi grafik metrik |
| React Dropzone | ^14 | Komponen drag-and-drop upload file |

### 4.2 Backend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| Python | ^3.10 | Bahasa pemrograman utama |
| FastAPI | ^0.111 | Framework API yang cepat dan modern |
| Uvicorn | ^0.29 | ASGI web server untuk menjalankan FastAPI |
| NumPy | ^1.26 | Operasi matriks untuk algoritma DCT & Huffman |
| OpenCV (`cv2`) | ^4.9 | Pemrosesan gambar & ekstraksi frame video |
| SciPy | ^1.13 | Pemrosesan dan I/O file audio WAV |
| Pillow (PIL) | ^10 | Konversi dan manipulasi format gambar |
| python-multipart | ^0.0.9 | Parsing file upload di FastAPI |

### 4.3 Lingkungan Pengembangan
| Tool | Kegunaan |
|---|---|
| Visual Studio Code | IDE pengembangan |
| Git + GitHub | Version control & kolaborasi |
| Postman | Testing endpoint API secara manual |
| Node.js v20+ | Menjalankan Frontend React |
| Python 3.10+ | Menjalankan Backend FastAPI |

---

## 5. Algoritma & Teori

### 5.1 Huffman Coding (Kompresi Lossless)

**Definisi:** Huffman Coding adalah algoritma kompresi *lossless* yang menggunakan tabel kode dengan panjang bervariasi berdasarkan frekuensi kemunculan simbol. Simbol yang sering muncul diberi kode lebih pendek, simbol jarang muncul diberi kode lebih panjang.

**Langkah Algoritma (Kompresi):**
1. Hitung frekuensi setiap nilai piksel (0-255) dalam gambar.
2. Buat *priority queue* (min-heap) dari semua nilai berdasarkan frekuensinya.
3. Bangun Pohon Huffman (*Huffman Tree*) dengan cara menggabungkan dua node terkecil berulang kali sampai hanya tersisa satu root.
4. Buat *codebook*: traversal pohon dari root. Pergi ke kiri = tambah bit `0`, pergi ke kanan = tambah bit `1`.
5. Encoding: Ganti setiap piksel dengan kode binernya dari *codebook*.
6. Simpan *codebook* dan data terenkoding ke file output.

**Langkah Algoritma (Dekompresi):**
1. Baca *codebook* dari file.
2. Rekonstruksi Pohon Huffman dari *codebook*.
3. Dekode aliran bit menggunakan pohon: traversal setiap bit, ketika mencapai daun (*leaf node*) → catat nilai piksel, ulangi dari root.
4. Rekonstruksi data piksel asli menjadi gambar kembali.

**Kompleksitas:**
- Waktu: $O(n \log n)$ dimana $n$ adalah jumlah simbol unik.
- Rasio kompresi: ~20-50% pengurangan ukuran (bergantung pada distribusi data).

**Pseudocode:**
```
function build_huffman_tree(frequencies):
    heap = MinHeap(frequencies)
    while len(heap) > 1:
        left = heap.extract_min()
        right = heap.extract_min()
        merged = Node(freq = left.freq + right.freq, left, right)
        heap.insert(merged)
    return heap.extract_min()  // root of Huffman Tree

function generate_codes(node, prefix="", codebook={}):
    if node.is_leaf:
        codebook[node.symbol] = prefix
    else:
        generate_codes(node.left, prefix + "0", codebook)
        generate_codes(node.right, prefix + "1", codebook)
    return codebook
```

---

### 5.2 DCT — Discrete Cosine Transform (Kompresi Lossy)

**Definisi:** DCT mengubah sinyal dari domain spasial (nilai piksel) ke domain frekuensi. Komponen frekuensi tinggi (detail halus) yang kurang sensitif bagi mata manusia kemudian dihilangkan (dikuantisasi), menghasilkan kompresi yang signifikan dengan penurunan kualitas yang minimal.

**Langkah Algoritma (Kompresi Gambar):**
1. Konversi gambar dari RGB ke ruang warna YCbCr (Luminance + Chrominance).
2. Pisahkan setiap channel, bagi gambar menjadi blok berukuran **8×8 piksel**.
3. Untuk setiap blok, hitung DCT 2D menggunakan rumus:

$$F(u,v) = \frac{1}{4} C(u)C(v) \sum_{x=0}^{7} \sum_{y=0}^{7} f(x,y) \cos\left[\frac{(2x+1)u\pi}{16}\right] \cos\left[\frac{(2y+1)v\pi}{16}\right]$$

   dimana $C(u) = \frac{1}{\sqrt{2}}$ jika $u = 0$, dan $C(u) = 1$ jika $u > 0$.

4. Bagi koefisien DCT dengan **Matriks Kuantisasi (Q)** lalu bulatkan ke integer: $B(u,v) = \text{round}\left(\frac{F(u,v)}{Q(u,v)}\right)$
5. Encode koefisien hasil kuantisasi (banyak yang menjadi 0) menggunakan *Run-Length Encoding* untuk menghemat lebih lanjut.
6. Simpan koefisien terkompresi.

**Langkah Algoritma (Dekompresi):**
1. Baca koefisien terkompresi.
2. Kalikan kembali dengan Matriks Kuantisasi: $\hat{F}(u,v) = B(u,v) \times Q(u,v)$.
3. Hitung Inverse DCT (IDCT) untuk mengembalikan blok ke domain spasial (nilai piksel).
4. Gabungkan semua blok 8×8 kembali menjadi gambar utuh.
5. Konversi YCbCr kembali ke RGB.

**Matriks Kuantisasi Standar (JPEG Luminance):**
```
[16, 11, 10, 16, 24,  40,  51,  61],
[12, 12, 14, 19, 26,  58,  60,  55],
[14, 13, 16, 24, 40,  57,  69,  56],
[14, 17, 22, 29, 51,  87,  80,  62],
[18, 22, 37, 56, 68,  109, 103, 77],
[24, 35, 55, 64, 81,  104, 113, 92],
[49, 64, 78, 87, 103, 121, 120, 101],
[72, 92, 95, 98, 112, 100, 103, 99]
```

**Metrik Kualitas (untuk laporan):**
$$PSNR = 10 \cdot \log_{10}\left(\frac{MAX_I^2}{MSE}\right)$$

Dimana $MSE$ (*Mean Squared Error*) adalah rata-rata kuadrat error antara piksel asli dan hasil dekompresi. Semakin tinggi PSNR, semakin baik kualitas hasil dekompresi (PSNR ≥ 30 dB dianggap baik secara visual).

---

### 5.3 LSB Steganografi (Least Significant Bit)

**Definisi:** LSB Steganografi adalah teknik menyembunyikan pesan rahasia dengan mengganti bit paling tidak signifikan (paling kanan) dari setiap nilai piksel/sampel audio dengan bit dari pesan rahasia.

**Mengapa LSB?** Mengubah bit paling kanan dari sebuah angka hanya mengubah nilainya sebesar 1 (dari 254 menjadi 255, misalnya). Perubahan 1 pada nilai warna tidak bisa dibedakan oleh mata manusia.

**Contoh Visual:**
```
Piksel Asli    : R=11001010, G=00110011, B=11110000
Pesan Rahasia  : "A" = 01000001 (dalam biner)

Setelah Sisip  :
  R = 11001010 → bit LSB diganti '0' → 11001010
  G = 00110011 → bit LSB diganti '1' → 00110011
  B = 11110000 → bit LSB diganti '0' → 11110000
  
  (Proses ini berlanjut ke piksel berikutnya untuk bit '0','0','0','0','1')
```

**Kapasitas Penyimpanan:**
- **Gambar:** 1 bit per channel piksel. Untuk gambar RGB, kapasitas = $\frac{lebar \times tinggi \times 3}{8}$ bytes.
- **Audio:** 1 bit per sampel. Untuk audio WAV 16-bit mono, kapasitas = $\frac{jumlah\_sampel}{8}$ bytes.
- **Video:** Per-frame seperti gambar. Total kapasitas = kapasitas_per_frame × jumlah_frame.

**Langkah Algoritma (Encode — Penyisipan):**
1. Baca file media (gambar/audio/video) ke dalam array NumPy.
2. Konversi pesan teks rahasia menjadi string biner (setiap karakter → 8 bit ASCII).
3. Tambahkan **penanda akhir pesan** (delimiter): misalnya string `###END###` dalam biner.
4. Iterasi setiap nilai dalam array media, ganti LSB-nya dengan bit pesan satu per satu.
5. Pastikan panjang pesan tidak melebihi kapasitas media.
6. Simpan array yang sudah dimodifikasi sebagai file baru (PNG / WAV / AVI).

**Langkah Algoritma (Decode — Ekstraksi):**
1. Baca file media yang sudah disisipi pesan ke dalam array NumPy.
2. Iterasi setiap nilai, ambil bit LSB-nya satu per satu, kumpulkan dalam string.
3. Setiap 8 bit, konversi menjadi satu karakter ASCII.
4. Terus lakukan hingga ditemukan **penanda akhir pesan** (delimiter).
5. Tampilkan pesan rahasia yang berhasil diekstrak.

> [!WARNING]
> **KRITIS:** Output file steganografi WAJIB disimpan dalam format **lossless** (PNG untuk gambar, WAV untuk audio, AVI uncompressed untuk video). Menyimpan dalam format JPG atau MP3 akan menghancurkan data LSB yang sudah disisipkan!

---

## 6. Desain API Backend (FastAPI)

**Base URL:** `http://localhost:8000`

### 6.1 Endpoint Kompresi & Dekompresi

| Method | Endpoint | Deskripsi | Input |
|---|---|---|---|
| POST | `/compress/huffman` | Kompresi gambar dengan Huffman | File gambar (PNG/BMP) |
| POST | `/decompress/huffman` | Dekompresi file Huffman | File `.huff` |
| POST | `/compress/dct` | Kompresi gambar dengan DCT | File gambar (PNG/BMP), `quality` (1-100) |
| POST | `/decompress/dct` | Dekompresi file DCT | File `.dct` |
| POST | `/compress/audio` | Kompresi audio dengan Huffman | File audio WAV |
| POST | `/decompress/audio` | Dekompresi audio Huffman | File `.huff` |

### 6.2 Endpoint Steganografi

| Method | Endpoint | Deskripsi | Input |
|---|---|---|---|
| POST | `/stego/image/encode` | Sisipkan pesan ke gambar | File gambar (PNG/BMP), `message` (string) |
| POST | `/stego/image/decode` | Ekstrak pesan dari gambar | File gambar yang sudah disisipi |
| POST | `/stego/audio/encode` | Sisipkan pesan ke audio | File audio WAV, `message` (string) |
| POST | `/stego/audio/decode` | Ekstrak pesan dari audio | File audio yang sudah disisipi |
| POST | `/stego/video/encode` | Sisipkan pesan ke video | File video AVI, `message` (string), `frame_index` |
| POST | `/stego/video/decode` | Ekstrak pesan dari video | File video yang sudah disisipi, `frame_index` |

### 6.3 Format Response API (JSON)

**Response Sukses (Kompresi):**
```json
{
  "status": "success",
  "original_size_bytes": 524288,
  "compressed_size_bytes": 131072,
  "compression_ratio": "75.00%",
  "psnr_db": 34.5,
  "execution_time_ms": 312,
  "download_url": "/download/compressed_result_abc123.png"
}
```

**Response Sukses (Steganografi Decode):**
```json
{
  "status": "success",
  "message": "Pesan rahasia yang berhasil diekstrak",
  "execution_time_ms": 145
}
```

**Response Error:**
```json
{
  "status": "error",
  "code": 422,
  "detail": "Format file tidak didukung. Gunakan format PNG atau BMP untuk gambar."
}
```

---

## 7. Desain Antarmuka Pengguna (Frontend React)

### 7.1 Halaman & Navigasi
```
/                   → Landing Page (Halaman Utama / Hero)
/compress           → Halaman Kompresi & Dekompresi
/steganography      → Halaman Steganografi
/about              → Halaman Tentang Proyek & Algoritma
```

### 7.2 Deskripsi Tiap Halaman

**Landing Page (`/`)**
- Hero section dengan judul besar, deskripsi singkat, dan tombol "Mulai Sekarang".
- Kartu fitur: Kompresi, Dekompresi, Steganografi.
- Animasi latar (misalnya partikel atau gelombang) untuk kesan modern dan premium.

**Halaman Kompresi (`/compress`)**
- **Step 1:** Pilih jenis media (Gambar / Audio / Video) dengan tombol tab.
- **Step 2:** Pilih algoritma (Huffman / DCT).
- **Step 3:** Area Drag-and-drop untuk upload file.
- **Step 4:** Tombol "Kompres Sekarang!" → loading spinner → tampilkan hasil.
- **Panel Hasil:**
  - Ukuran file Sebelum vs Sesudah (visual progress bar).
  - Nilai PSNR (untuk DCT).
  - Waktu eksekusi.
  - Tombol "Unduh Hasil".
  - Preview gambar (sebelum & sesudah, side-by-side) untuk tipe gambar.

**Halaman Steganografi (`/steganography`)**
- **Tab:** "Sisipkan Pesan" (Encode) | "Ekstrak Pesan" (Decode).
- **Mode Encode:**
  - Pilih jenis media (Gambar / Audio / Video).
  - Upload file media (cover).
  - Input teks area untuk mengetik pesan rahasia.
  - Tampilkan kapasitas pesan yang tersisa secara real-time.
  - Tombol "Sisipkan & Unduh".
- **Mode Decode:**
  - Upload file yang sudah disisipi pesan.
  - Tombol "Ekstrak Pesan".
  - Tampilkan pesan rahasia yang berhasil diekstrak dalam kotak teks.

### 7.3 Panduan Desain Visual (untuk Dapoy)
| Aspek | Spesifikasi |
|---|---|
| **Color Palette** | Dark mode: Background `#0f0f1a`, Card `#1a1a2e`, Aksen `#7c3aed` (ungu), Highlight `#06b6d4` (cyan) |
| **Font** | Heading: `Space Grotesk`, Body: `Inter` (dari Google Fonts) |
| **Animasi** | Transisi halaman: `framer-motion`. Hover card: `scale(1.03)` dengan `ease-out`. |
| **Border Radius** | Global: `1rem` (16px) untuk kartu, `0.5rem` untuk tombol |
| **Shadow** | Box shadow: `0 0 30px rgba(124, 58, 237, 0.2)` — efek glow ungu halus |

---

## 8. Alur Data (Data Flow)

### 8.1 Alur Kompresi Gambar (DCT)
```
User Upload PNG
      │
      ▼
FastAPI menerima file (UploadFile)
      │
      ▼
Simpan file sementara di /temp
      │
      ▼
OpenCV baca gambar → NumPy Array
      │
      ▼
Konversi RGB → YCbCr
      │
      ▼
Bagi menjadi blok 8×8
      │
      ▼
Terapkan scipy.fftpack.dct() pada setiap blok
      │
      ▼
Bagi dengan Matriks Kuantisasi → Bulatkan ke integer
      │
      ▼
Simpan koefisien sebagai file .dct (format kustom / numpy .npy)
      │
      ▼
Hitung Rasio Kompresi, PSNR, Execution Time
      │
      ▼
Return JSON Response + URL Download file .dct
      │
      ▼
Frontend tampilkan metrik + tombol Download
```

### 8.2 Alur Steganografi Gambar LSB (Encode)
```
User Upload Gambar PNG + Input Pesan Teks
      │
      ▼
FastAPI menerima file + teks
      │
      ▼
OpenCV baca gambar → NumPy Array [H × W × 3]
      │
      ▼
Konversi teks → biner string (+ delimiter "###END###")
      │
      ▼
Periksa: len(biner) <= H × W × 3 ?
   │                    │
   │ YA                 │ TIDAK → Return Error 400
   ▼                    ▼
Iterasi piksel:
  Ganti LSB nilai piksel dengan bit pesan, satu per satu
      │
      ▼
Simpan array yang dimodifikasi sebagai PNG baru (WAJIB PNG!)
      │
      ▼
Return JSON Response + URL Download PNG (stego image)
      │
      ▼
Frontend tampilkan tombol Download
```

---

## 9. Struktur Folder Proyek

```
multimedia-codec-project/
│
├── backend/                        # Python FastAPI
│   ├── main.py                     # Entry point & konfigurasi CORS
│   ├── requirements.txt            # Daftar dependensi Python
│   ├── routers/
│   │   ├── compress_router.py      # Endpoint kompresi & dekompresi
│   │   └── stego_router.py         # Endpoint steganografi
│   ├── services/
│   │   ├── huffman.py              # Implementasi algoritma Huffman
│   │   ├── dct.py                  # Implementasi algoritma DCT
│   │   └── lsb.py                  # Implementasi algoritma LSB
│   ├── utils/
│   │   ├── file_handler.py         # Fungsi upload, simpan, bersihkan temp
│   │   └── metrics.py              # Fungsi hitung PSNR, rasio kompresi
│   └── temp/                       # Folder penyimpanan file sementara (auto-cleaned)
│
└── frontend/                       # React + Vite
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx                # Entry point React
    │   ├── App.jsx                 # Routing utama
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── CompressPage.jsx
    │   │   ├── StegoPage.jsx
    │   │   └── AboutPage.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── FileDropzone.jsx    # Komponen drag & drop upload
    │   │   ├── MetricsCard.jsx     # Kartu tampilan hasil metrik
    │   │   └── ImagePreview.jsx    # Preview gambar before/after
    │   ├── services/
    │   │   └── api.js              # Semua fungsi pemanggilan API (Axios)
    │   └── assets/                 # Gambar, ikon, dll
    └── public/
```

---

## 10. Format Media yang Didukung

| Modul | Jenis Media | Format Input | Format Output | Catatan |
|---|---|---|---|---|
| Huffman Kompresi | Gambar | `.png`, `.bmp` | `.huff` (kustom) | File biner berisi codebook + data terenkode |
| Huffman Dekompresi | File Huffman | `.huff` | `.png` | Rekonstruksi gambar asli (identik 100%) |
| DCT Kompresi | Gambar | `.png`, `.bmp` | `.dct` (NumPy array) | Ada penurunan kualitas (lossy) |
| DCT Dekompresi | File DCT | `.dct` | `.png` | Kualitas tergantung faktor Q |
| LSB Encode | Gambar | `.png`, `.bmp` | `.png` | **WAJIB** output PNG! |
| LSB Decode | Gambar | `.png` | Teks (JSON) | — |
| LSB Encode | Audio | `.wav` | `.wav` | Audio mono/stereo 16-bit |
| LSB Decode | Audio | `.wav` | Teks (JSON) | — |
| LSB Encode | Video | `.avi` | `.avi` | Pesan disisip di frame tertentu |
| LSB Decode | Video | `.avi` | Teks (JSON) | Harus tahu index frame yang disisipi |

---

## 11. Rencana Pengujian

### 11.1 Pengujian Unit Backend (untuk Dapoy)
Buat file `tests/test_algorithms.py`:
- **Test Huffman:** Encode lalu Decode sebuah gambar, pastikan output identik dengan input (*bit-perfect*).
- **Test DCT:** Kompres lalu Dekompres gambar, ukur PSNR > 30 dB.
- **Test LSB Gambar:** Encode pesan lalu Decode, pastikan pesan yang didapatkan sama persis.
- **Test Kapasitas LSB:** Coba sisipkan pesan yang lebih besar dari kapasitas, pastikan API mengembalikan error 400 yang informatif.

### 11.2 Pengujian Fungsional Web (untuk Dwi — bahan laporan)
| No | Skenario Uji | Input | Ekspektasi |
|---|---|---|---|
| 1 | Kompresi Huffman Gambar | `sample.png` (1MB) | File `.huff` dapat diunduh, ukuran lebih kecil |
| 2 | Dekompresi Huffman | File `.huff` dari test 1 | Gambar PNG identik dengan `sample.png` |
| 3 | Kompresi DCT Kualitas Tinggi | `sample.png`, quality=90 | PSNR > 35 dB, ukuran lebih kecil |
| 4 | Kompresi DCT Kualitas Rendah | `sample.png`, quality=20 | PSNR 25-30 dB, ukuran sangat kecil |
| 5 | Steganografi Encode Gambar | `cover.png`, pesan="Hello World" | File PNG dapat diunduh, terlihat sama |
| 6 | Steganografi Decode Gambar | File hasil test 5 | Pesan "Hello World" berhasil diekstrak |
| 7 | Steganografi Encode Audio | `cover.wav`, pesan="Rahasia" | File WAV dapat diunduh |
| 8 | Steganografi Decode Audio | File hasil test 7 | Pesan "Rahasia" berhasil diekstrak |
| 9 | Upload format salah | File `.jpg` ke LSB encode | API kembalikan pesan error yang jelas |
| 10 | Pesan terlalu panjang | Pesan melebihi kapasitas gambar | API kembalikan error 400 |

### 11.3 File Uji yang Perlu Disiapkan (Tugas Aldy)
- `sample_image.png` — gambar berwarna ukuran 512×512 piksel.
- `sample_image.bmp` — versi BMP dari gambar yang sama.
- `sample_audio.wav` — audio pendek berdurasi 5 detik, format WAV 16-bit mono.
- `sample_video.avi` — video pendek berdurasi 3 detik, resolusi 480p.

---

## 12. Pembagian Tugas & Timeline

### Pembagian Tugas Detail

**Aldy (Perancang Sistem) — *Sudah selesai dengan dokumen ini*:**
- [x] Membuat Dokumen Rancangan Sistem (dokumen ini).
- [ ] Menyiapkan file uji (gambar, audio, video).
- [ ] Membuat diagram arsitektur sistem (opsional, untuk laporan Dwi).
- [ ] Melakukan review dan testing akhir sebelum presentasi.

**Dapoy (Developer):**
- [ ] Setup repository GitHub dan struktur folder proyek.
- [ ] Implementasi algoritma Huffman di `services/huffman.py`.
- [ ] Implementasi algoritma DCT di `services/dct.py`.
- [ ] Implementasi LSB di `services/lsb.py`.
- [ ] Membuat semua endpoint FastAPI di `routers/`.
- [ ] Setup project React + Vite + TailwindCSS.
- [ ] Membuat semua halaman dan komponen UI.
- [ ] Integrasi Frontend ke Backend (Axios).
- [ ] Testing dan perbaikan bug.

**Dwi (Dokumentasi):**
- [ ] Menulis Bab 1: Pendahuluan (Latar Belakang, Tujuan, Ruang Lingkup).
- [ ] Menulis Bab 2: Landasan Teori (algoritma Huffman, DCT, LSB).
- [ ] Menulis Bab 3: Metodologi / Desain Sistem (gunakan dokumen ini sebagai referensi).
- [ ] Menulis Bab 4: Hasil Pengujian (gunakan tabel dari Bab 11.2 dan screenshot web yang sudah jadi).
- [ ] Menulis Bab 5: Kesimpulan dan Saran.

### Estimasi Timeline (3 Minggu)
| Minggu | Aldy | Dapoy | Dwi |
|---|---|---|---|
| **Minggu 1** | Finalisasi rancangan, siapkan file uji | Setup project, implementasi algoritma backend | Tulis Bab 1 & Bab 2 (Landasan Teori) |
| **Minggu 2** | Review kode Dapoy, bantu testing | Implementasi Frontend, integrasi API | Tulis Bab 3 (Metodologi) dari dokumen rancangan ini |
| **Minggu 3** | Testing menyeluruh, siapkan presentasi | Bug fixing, polish UI, deploy | Tulis Bab 4 (Hasil), Bab 5, dan lengkapi laporan |

---

## 13. Risiko & Mitigasi

| # | Risiko | Kemungkinan | Dampak | Mitigasi |
|---|---|---|---|---|
| 1 | Kompresi Video terlalu lambat | Tinggi | Tinggi | Batasi video demo maksimal 3 detik, resolusi 480p |
| 2 | CORS error antara React & FastAPI | Tinggi | Sedang | Tambahkan `CORSMiddleware` di `main.py` FastAPI dengan `allow_origins=["*"]` |
| 3 | Pesan steganografi rusak saat disimpan | Sedang | Tinggi | Selalu validasi format output di backend (tolak JPG, paksa PNG) |
| 4 | Ukuran file terlalu besar menyebabkan timeout | Sedang | Sedang | Tambahkan batas ukuran file upload (max 50MB) di FastAPI |
| 5 | Dapoy tidak familiar dengan NumPy/OpenCV | Sedang | Tinggi | Sediakan kode contoh (snippet) dasar di setiap file `services/` sebagai kerangka awal |

---

## Lampiran: Referensi Pustaka

1. Huffman, D. A. (1952). "A Method for the Construction of Minimum-Redundancy Codes". *Proceedings of the IRE*, 40(9), 1098–1101.
2. Ahmed, N., Natarajan, T., & Rao, K. R. (1974). "Discrete Cosine Transform". *IEEE Transactions on Computers*, 23(1), 90–93.
3. Chan, C. K., & Cheng, L. M. (2004). "Hiding data in images by simple LSB substitution". *Pattern Recognition*, 37(3), 469–474.
4. Dokumentasi Resmi FastAPI: https://fastapi.tiangolo.com/
5. Dokumentasi Resmi React: https://react.dev/
6. Dokumentasi OpenCV Python: https://docs.opencv.org/

---
*Dokumen ini dibuat oleh Aldy sebagai Perancang Sistem dan dapat digunakan sebagai acuan oleh seluruh anggota tim.*
