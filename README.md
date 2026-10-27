# Koeweh website starter

## File
- index.html: website customer
- admin.html: dashboard owner
- style.css: tampilan responsif
- script.js: menu, keranjang, checkout, pembayaran
- admin.js: login owner dan manajemen status
- config.js: URL/key Supabase, menu, QRIS, rekening
- supabase-schema.sql: tabel pesanan dan keamanan RLS
- foto/: foto produk dan QRIS

## 1. Foto
Masukkan foto ke folder foto/ dengan nama hero-risol.jpg (opsional), risol-sosis.jpg, risol-ragout.jpg, dan qris.png (QRIS asli).

## 2. Supabase
1. Buat project di https://supabase.com/.
2. Salin Project URL dan anon/publishable key dari Project Settings > API.
3. Ganti placeholder URL/key di config.js. Jangan pernah gunakan service_role key.
4. Di Authentication > Users, buat akun owner dengan email/password; matikan public sign-up bila tidak diperlukan.
5. Ganti setiap owner@example.com dalam supabase-schema.sql dengan email owner yang persis sama, lalu jalankan SQL di SQL Editor.
6. Isi nama bank, nomor rekening, nama pemilik, dan detail menu di config.js. Tambahkan QRIS asli sebagai foto/qris.png.

## 3. Netlify
1. Simpan semua file dalam folder yang sama dengan subfolder foto/.
2. Buat akun di https://app.netlify.com/.
3. Deploy manual dengan mengunggah folder/ZIP hasil ekstrak melalui Netlify.
4. Uji website di URL Netlify.
5. Buka URL-SITE/admin.html, lalu login dengan akun owner Supabase.
6. Owner tekan Refresh untuk melihat pesanan; periksa pembayaran di aplikasi bank/QRIS, lalu ubah status pembayaran dan status pesanan.

## Penting
- Pembayaran versi ini manual. Website tidak memverifikasi uang masuk secara otomatis.
- Dashboard perlu dibuka dan tombol Refresh ditekan; notifikasi push/email otomatis belum disertakan.
- Harga/stok pada starter ini diatur di browser. Untuk toko publik yang serius, validasi harga dan stok harus dipindahkan ke backend/database.
- Kebijakan RLS membatasi baca/update kepada email owner yang ditulis di SQL. Pastikan email sama persis.
- Pastikan nomor rekening dan QRIS yang diunggah benar-benar milik owner.
