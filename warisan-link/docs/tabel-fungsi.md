# Tabel Fungsi Platform — WarisanLink

| Nama Fungsi | Role Pengguna | Masukan (Input) | Penjelasan | Validasi | Keluaran (Output) |
|------------|---------------|-----------------|------------|----------|-------------------|
| **Registrasi Turis** | Turis | nama, email, password, role=TURIS | Simpan user baru ke DB dengan status ACTIVE | Email unik; password min 8 char; role valid | User ACTIVE + JWT token; redirect ke beranda |
| **Registrasi Kontributor** | Kontributor | nama, email, password, role=KONTRIBUTOR, organisasi | Simpan user baru ke DB dengan status PENDING | Email unik; password min 8 char; organisasi opsional | User PENDING; pesan "Menunggu persetujuan admin" |
| **Login** | Semua | email, password | Autentikasi user dan buat JWT token | Email terdaftar; password cocok; status ACTIVE | JWT token (7 hari); redirect berdasarkan role |
| **Approve Kontributor** | Superadmin | userId (path param), status=ACTIVE | Ubah status user Kontributor menjadi ACTIVE | JWT valid; role === SUPERADMIN; user dalam status PENDING | User status ACTIVE; Kontributor dapat login dan upload |
| **Reject Pendaftaran** | Superadmin | userId, status=REJECTED | Tolak pendaftaran Kontributor | JWT valid; role === SUPERADMIN | User status REJECTED; login akan gagal dengan pesan khusus |
| **Lihat Dashboard Stats** | Superadmin | — | Ambil statistik: total user, pending, total destinasi, published | JWT valid; role === SUPERADMIN | { totalUsers, pendingUsers, totalDestinations, publishedDestinations } |
| **Upload Destinasi** | Kontributor | name, city, province, categoryId, shortDesc, culturalMeaning, localHistory, malaysiaConnection, localEtiquette, coverImage (file) | Simpan destinasi baru + gambar ke storage | JWT valid; role === KONTRIBUTOR; file berupa JPG/PNG/WebP; ukuran < 5MB; field wajib tidak kosong | Destination berstatus PENDING; file tersimpan di uploads/ |
| **Approve Destinasi** | Superadmin | destinationId, destStatus=PUBLISHED | Ubah status destinasi menjadi PUBLISHED agar tampil ke publik | JWT valid; role === SUPERADMIN | destStatus = PUBLISHED; destinasi tampil di beranda |
| **Browse Destinasi** | Public | query: category, province, search, page, limit | Ambil daftar destinasi PUBLISHED dengan filter & pagination | destStatus harus PUBLISHED; parameter page dan limit berupa angka positif | Paginated list: { destinations[], total, page, totalPages } |
| **Lihat Detail Destinasi** | Public | slug (path param) | Ambil detail destinasi + access compass + cuaca dari Open-Meteo API | Slug harus ada di DB; destStatus === PUBLISHED | Detail destinasi, compass, cuaca real-time, viewCount++ |
| **Cari Destinasi** | Public | query q (string pencarian) | Full-text search di nama, deskripsi, kota, provinsi | Minimal 1 karakter | Daftar destinasi yang cocok (bisa kosong) |
| **Simpan Journey** | Turis | destinationId | Simpan destinasi ke daftar journey pribadi | JWT valid; role === TURIS; destinasi belum disimpan (unique constraint) | JourneyItem tersimpan; 409 jika sudah ada |
| **Lihat Journey Saya** | Turis | — | Ambil daftar destinasi yang disimpan | JWT valid; role === TURIS | List JourneyItem dengan detail destinasi |
| **Lihat Destinasi Saya** | Kontributor | — | Ambil semua destinasi milik Kontributor yang login | JWT valid; role === KONTRIBUTOR | List destinasi dengan status (PENDING/PUBLISHED/REJECTED) |
| **Hapus Destinasi** | Kontributor/Superadmin | destinationId | Hapus destinasi dari sistem | JWT valid; Kontributor hanya bisa hapus miliknya; Superadmin bisa hapus semua | Destinasi dihapus; 403 jika bukan miliknya (untuk Kontributor) |
