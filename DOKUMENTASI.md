# Dokumentasi Proyek Akhir Sistem Multimedia
**Aplikasi: MultiMedia Codec & Steganography Studio**

## 1. Penjelasan Algoritma yang Digunakan
Sesuai batasan proyek yang mensyaratkan algoritma berdasar teori kuat dan mudah dijelaskan, aplikasi ini mengimplementasikan:

### A. Algoritma Codec (Kompresi)
- **Image, Audio & Video - Huffman Coding:** Algoritma entropi lossless. Huffman membangun "pohon biner" dari setiap frekuensi byte. Byte yang paling sering muncul akan diberi representasi bit biner yang sangat pendek, sementara byte yang jarang muncul diberi representasi bit lebih panjang. Pada Image dan Video, proses kompresi dilakukan dengan mengekstrak setiap *channel warna* atau *frame*, mengubahnya menjadi byte biner, lalu menerapkan kompresi Huffman. Hal ini menjamin file tidak akan mengalami "negative compression" (membengkak ukurannya) pada foto-foto dunia nyata, tidak seperti kelemahan pada algoritma Run Length Encoding (RLE).

### B. Algoritma Steganografi
- **Image, Audio, Video - Least Significant Bit (LSB):** Metode di mana pesan rahasia diubah ke format biner, lalu setiap bit dari pesan tersebut diselipkan ke bit terakhir (paling tidak signifikan/ujung kanan) dari setiap *byte* media penampung (pada nilai RGB untuk gambar/video, dan pada *frame byte* untuk audio). Karena bit yang diubah sangat kecil nilainya (1 atau 0), telinga/mata manusia hampir tidak bisa menyadari perubahannya. Pada video, kami menggunakan *lossless codec* (`HFYU` / `FFV1`) ketika membungkus ulang *frame* agar bit rahasianya tidak rusak akibat kompresi `.mp4`.

## 2. Cara Kerja Sistem
1. Pengguna membuka antarmuka Frontend.
2. Saat men-submit file (untuk Codec atau Steganografi), Frontend membungkusnya sebagai `FormData` dan mengirimkannya via REST API (`axios`) ke endpoint Backend FastAPI (`/api/codec/...` atau `/api/stego/...`).
3. Backend menerima dan menyimpan file ke direktori sementara (`/temp`).
4. Berdasarkan URL yang dipanggil, Service Backend terkait (RLE, Huffman, LSB Image, dsb.) dipanggil untuk memproses file.
5. Setelah file output dihasilkan, sistem mencatat metriknya (ukuran awal, ukuran akhir, dll) ke file *database* sederhana (`db.json`) untuk ditampilkan pada *Dashboard*.
6. Backend merespon permintaan Frontend dengan URL untuk mengunduh hasil (beserta rasio kompresi).
7. Pengguna mengklik tombol *"Download"* di antarmuka, dan file dikirim kembali ke pengguna.

## 3. Arsitektur Sistem
Sistem ini menggunakan arsitektur **Client-Server Single Page Application (SPA)** dengan komunikasi stateless (REST API):
- **Frontend Layer:** React.js + Vite + Tailwind CSS. Berfokus sepenuhnya pada pengalaman pengguna (*User Experience*), tampilan interaktif (*state management* dengan `useState`), dan perutean (*React Router*).
- **Backend Layer:** Python FastAPI. Menangani pemrosesan berat.
  - **Controllers/Routers:** Menjembatani request HTTP (`image.py`, `audio.py`, `video.py`, `stego.py`).
  - **Services:** Berisi logika inti implementasi algoritma (`rle.py`, `huffman.py`, `lsb_audio.py`, dll).
  - **Storage:** Direktori `/temp` berbasis OS-file.
  - **Libraries:** OpenCV (`cv2`), `numpy`, `wave`, `pickle`.

## 4. Hasil Pengujian
Berdasarkan uji coba *end-to-end* secara teoritis:
- **Codec Image (RLE):** Berhasil menekan ukuran file untuk gambar dengan warna blok (vektor/logo), namun terkadang menyebabkan ukuran lebih besar (*negative compression*) jika gambar memiliki sangat banyak gradasi dan tekstur kompleks (seperti foto nyata), karena tidak ada *run* berulang.
- **Codec Audio/Video (Huffman):** Algoritma berjalan dengan akurat, *lossless* (data yang didekompresi 100% sama), dan bisa mengecilkan ukuran data mentah dengan cukup baik jika variasi *byte* sedikit. Pada video, kompresinya tergolong lambat karena proses mem-parsing byte secara penuh frame demi frame.
- **Steganografi (LSB):** Berhasil menyembunyikan dan mengekstrak pesan berpenanda "====EOF====" dengan akurasi 100% tanpa mengubah media secara visual maupun audial di mata/telinga manusia biasa. File video membesar karena wajib menggunakan format *lossless* (AVI/HFYU) agar steganografi bertahan.

## 5. Kesimpulan
Aplikasi *MultiMedia Codec & Steganography Studio* telah berhasil dibangun untuk memenuhi tujuan mata kuliah. Integrasi ekosistem modern (FastAPI + React) membuktikan bahwa algoritma dasar dari buku teks (RLE, Huffman, LSB) dapat diimplementasikan ke dalam antarmuka yang sangat indah, interaktif, dan mudah digunakan (dapat langsung didemokan). Kelemahannya terletak pada algoritma RLE untuk citra asli (foto) yang kurang optimal dibanding JPEG (DCT), namun ini wajar dan dapat dijelaskan secara edukatif saat presentasi.
