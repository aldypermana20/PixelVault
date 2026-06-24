# 🎤 Materi Presentasi: PixelVault
**Web App Codec & Steganografi**

Dokumen ini disusun sebagai panduan materi dan naskah dasar untuk kebutuhan presentasi proyek PixelVault. Anda dapat menggunakan struktur penjelasan di bawah ini untuk menerangkan alur kerja sistem dan algoritma kepada dosen atau audiens.

---

## 🌟 1. Pendahuluan & Latar Belakang
**Poin Presentasi:**
*   Perkenalkan nama proyek: **PixelVault**.
*   Proyek ini adalah sebuah aplikasi berbasis web yang fokus pada **manipulasi biner level dasar** dari file multimedia.
*   Tujuan utamanya ada dua:
    1.  **Kompresi (Codec):** Bagaimana cara menyusutkan ukuran file tanpa menghilangkan kualitas aslinya sedikitpun (*Lossless*).
    2.  **Keamanan (Steganografi):** Bagaimana menyembunyikan pesan rahasia di dalam file gambar, audio, maupun video tanpa membuat file tersebut terlihat mencurigakan.
*   **Tech Stack yang Digunakan:**
    *   **Frontend:** React.js (Vite) + Tailwind CSS (Antarmuka responsif yang mengirimkan file secara asinkron).
    *   **Backend:** Python FastAPI (Untuk menangani komputasi algoritma tingkat tinggi menggunakan OpenCV, Numpy, dan algoritma *native* Python).

---

## ⚙️ 2. Alur Kerja Sistem (Workflow)
**Poin Presentasi:**
Jelaskan bagaimana file bergerak dari komputer pengguna hingga selesai diproses.

1.  **Pengguna (Frontend):** Pengguna mengunggah (*upload*) file (Gambar/Audio/Video) dan memasukkan parameter (misal teks rahasia) melalui antarmuka web.
2.  **Transmisi:** File dikirim menggunakan protokol HTTP (via Axios) dalam bentuk `multipart/form-data` menuju backend server.
3.  **Pemrosesan (Backend):**
    *   FastAPI menerima file dan menyimpannya sementara di folder `temp/`.
    *   Sistem membaca file tersebut, apakah akan masuk jalur **Codec (Kompresi)** atau jalur **Steganografi**.
    *   File dibongkar menjadi susunan biner atau matriks (menggunakan OpenCV untuk gambar/video, dan library `wave` untuk audio).
    *   Algoritma inti dieksekusi.
4.  **Pengembalian Hasil:** Backend menghasilkan file baru yang sudah dimodifikasi (misal `.huff` untuk kompresi atau `.png` berpesan rahasia). Frontend menerima URL download beserta data statistik (ukuran asli vs ukuran baru), lalu menampilkannya ke layar.

---

## 🧮 3. Algoritma 1: Huffman Coding (Modul Kompresi)
**Poin Presentasi:**
Sistem kami menggunakan murni algoritma Huffman Coding untuk mengompresi gambar, audio, dan video secara *Lossless*.

*   **Prinsip Kerja Dasar:** Huffman mengkompresi data dengan cara memberikan "kode biner pendek" untuk karakter/byte yang sering muncul, dan "kode biner panjang" untuk byte yang jarang muncul.
*   **Langkah-langkah dalam Kode Kita:**
    1.  **Membaca Frekuensi:** Sistem membaca struktur file dan menghitung berapa kali setiap byte muncul.
    2.  **Membangun Pohon Huffman (*Tree*):** Menggunakan struktur data *Min-Heap*, byte-byte tersebut dirakit menjadi struktur pohon untuk menentukan kode biner akhir.
    3.  **Encoding:** File asli dikonversi menjadi urutan bit panjang berdasar kamus dari pohon tadi.
    4.  **Penyimpanan Kustom:** Bitstream, kamus frekuensi, dan jumlah *padding* (pengisi sisa bit) disimpan ke dalam ekstensi kustom kami yaitu `.huff` (menggunakan library `pickle`).
*   **Fakta Menarik untuk Diceritakan (PENTING!): Konsep *Negative Compression***
    *   Jelaskan kepada dosen bahwa algoritma ini **sangat efektif** pada file "Mentah" seperti `.bmp` (Gambar) atau `.wav` (Audio PCM).
    *   Namun, jika kita memasukkan file yang sudah punya kompresi tingkat tinggi bawaan (seperti `.png`, `.jpg`, atau `.mp4`), file output Huffman justru **akan membengkak (jadi lebih besar)**.
    *   *Kenapa?* Karena data di file PNG/MP4 sudah terkompresi maksimal (entropi sangat tinggi dan acak). Menimpa Huffman di atasnya hanya akan menjadi beban tambahan ukuran kamus algoritma (*dictionary overhead*), sebuah fakta teknis nyata dalam ilmu teori informasi.

---

## 🕵️ 4. Algoritma 2: Least Significant Bit / LSB (Modul Steganografi)
**Poin Presentasi:**
Sistem kami menerapkan steganografi level bit, bukan sekadar penempelan teks di metadata. Pesan rahasia benar-benar melebur ke dalam piksel atau gelombang suara.

*   **Prinsip Kerja LSB:** Komputer membaca warna (pada gambar) atau amplitudo (pada audio) dalam bentuk biner (angka 0 dan 1). LSB memanipulasi bit ke-8 (bit paling kanan / bit paling tidak signifikan) dari setiap byte media.
*   **Mengapa Tidak Terlihat/Terdengar?** Mengubah bit paling belakang hanya akan menambah atau mengurangi nilai desimal maksimal sebesar **1 poin**. Mata dan telinga manusia secara biologis **tidak mampu** membedakan perubahan nilai warna RGB atau nilai suara sebesar 1 poin, sehingga hasilnya terlihat 100% identik dengan aslinya.
*   **Alur Kerja Kode Kita:**
    1.  Teks rahasia dari pengguna diubah ke urutan biner. Ditambahkan juga "Penanda Akhir" (`====EOF====`) agar sistem tahu kapan pesan selesai diekstrak nanti.
    2.  **Untuk Gambar:** Bit disisipkan berurutan ke warna Red, Green, dan Blue (RGB) pada tiap piksel menggunakan pembacaan OpenCV.
    3.  **Untuk Audio:** Bit disisipkan ke amplitudo per-frame pada gelombang suara murni (WAV PCM).
    4.  **Untuk Video:** Video dipecah per-frame, tiap piksel pada frame disisipi pesan hingga pesan habis. **(Hal teknis yang bisa ditonjolkan):** Kami mengatur backend untuk menyimpan ulang video ini dengan Codec **HFYU (Lossless Huffman)**, karena jika disave ke codec MP4 biasa, kompresi lossy-nya akan merusak bit LSB kita.
*   **Batasan Teknis (Syarat Utama):** 
    *   Jelaskan bahwa LSB **Sangat Benci dengan Kompresi Lossy**. File stego *tidak boleh* disimpan sebagai `.jpg` atau `.mp3`. Algoritma kompresi JPG/MP3 memotong frekuensi data yang detail, sehingga bit LSB yang membawa pesan rahasia otomatis hancur berantakan jika menggunakan ekstensi tersebut. Kami mewajibkan output PNG, WAV, dan AVI murni.

---

## 🚀 5. Penutup & Demo Praktik
**Tips saat mendemokan aplikasi:**
1.  **Demo Kompresi:** Gunakan file mentah (misal `.bmp` atau `.wav`) untuk menunjukkan secara *live* bagaimana *Compression Ratio* menyusut drastis berkat Huffman, dan tunjukkan ukuran *Original Size* vs *Compressed Size* yang tampil di layar.
2.  **Demo Steganografi:** Gunakan gambar `.png`. Sisipkan teks panjang. Lalu download file hasilnya (yang secara kasat mata sama sekali tak berubah). Unggah kembali file hasil tersebut di tab *Extract* untuk memunculkan pesan ajaibnya!

> *"Melalui PixelVault, kami tidak hanya menggunakan tools pihak ketiga, tapi kami membedah dan memanipulasi file pada tingkatan bit terkecilnya dari nol menggunakan prinsip matematika struktural dari algoritma Huffman dan Least Significant Bit."*
