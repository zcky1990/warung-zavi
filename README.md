# Warung Zavi | Debt Tracker 🏪

Aplikasi berbasis web untuk mencatat hutang pembeli, mengelola data barang, dan memantau pendapatan harian. Dibangun menggunakan **Vue.js 3 (Vite)** dan menggunakan **Google Sheets** sebagai database.

## Fitur Utama 🚀

- **Catat Hutang**: Input data hutang per pelanggan dengan hitungan otomatis.
- **Manajemen Pembeli**: Daftar pelanggan beserta info nomor telepon/alamat.
- **Katalog Produk**: Daftar barang dagangan beserta harga yang bisa dipilih saat mencatat hutang.
- **Pembayaran**: Tombol bayar hutang dengan pilihan metode (Cash, Transfer, Dana, QRIS).
- **Laporan Pendapatan**: Lihat total uang yang masuk per hari.
- **Login Sederhana**: Hardcoded login (User: `devia` | Pass: `password123`).

## Cara Instalasi & Jalankan (Lokal) 💻

1. Pastikan Anda memiliki **Node.js** terinstal.
2. Masuk ke direktori project:
   ```bash
   cd warung-zavi
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Jalankan aplikasi (Mode Development):
   ```bash
   npm run dev
   ```

## Setup Google Sheets (Database) 📊

Aplikasi ini menggunakan Google Sheets sebagai database agar data tersimpan permanen.

1. Buat **Google Sheet** baru.
2. Buka menu **Extensions > Apps Script**.
3. Salin kode dari file `scripts/google_apps_script.js` ke editor script tersebut.
4. Ganti `YOUR_SHEET_ID_HERE` dengan ID Google Sheet Anda (bisa diambil dari URL spreadsheet).
5. Klik **Deploy > New Deployment**.
   - Pilih type: **Web App**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
6. Salin **Web App URL** yang muncul.
7. Buat file bernama `.env` di folder utama project ini:
   ```bash
   cp .env.example .env
   ```
8. Buka file `.env` tersebut, lalu masukkan URL yang Anda salin tadi ke `VITE_WARUNG_ZAVI_API_URL`.

## Tech Stack 🛠️

- **Frontend**: Vue.js 3 (Composition API)
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue Next
- **Backend**: Google Apps Script & Google Sheets

## Deployment ke GitHub Pages 🌐

1. Jalankan perintah build:
   ```bash
   npm run build
   ```
2. Upload folder `dist` atau hubungkan repository ke GitHub Pages (atur source ke folder `dist` atau gunakan GitHub Actions).

---
Dibuat dengan ❤️ untuk Warung Zavi.
