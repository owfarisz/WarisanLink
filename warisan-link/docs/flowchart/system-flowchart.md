# System Flowchart — WarisanLink

```mermaid
flowchart TD
    START([🌐 User Mengakses wisatalink.space]) --> AUTH{Sudah Login?}

    AUTH -->|Tidak| GUEST_BROWSE[Browse Destinasi sebagai Guest]
    AUTH -->|Ya| ROLE_CHECK{Role User?}

    GUEST_BROWSE --> GUEST_FILTER[Filter / Cari Destinasi]
    GUEST_FILTER --> GUEST_RESULT{Hasil Ditemukan?}
    GUEST_RESULT -->|Tidak| EMPTY_STATE[Tampilkan Empty State]
    GUEST_RESULT -->|Ya| GUEST_LIST[Tampilkan Heritage Cards]
    GUEST_LIST --> GUEST_DETAIL[Buka Detail Destinasi]
    GUEST_DETAIL --> GUEST_INFO[Lihat Info Budaya & Sejarah]
    GUEST_DETAIL --> GUEST_COMPASS[Access Compass & Peta Leaflet]
    GUEST_DETAIL --> GUEST_WEATHER[Cuaca Real-time Open-Meteo]
    GUEST_DETAIL --> WANT_SAVE{Ingin Simpan Journey?}
    WANT_SAVE -->|Ya| NEED_LOGIN[Arahkan ke /login]
    WANT_SAVE -->|Tidak| DONE_GUEST([Selesai])

    NEED_LOGIN --> REG_OR_LOGIN{Sudah punya akun?}
    REG_OR_LOGIN -->|Tidak| REGISTER_FLOW
    REG_OR_LOGIN -->|Ya| LOGIN_FLOW

    subgraph REGISTER_FLOW ["📝 Alur Registrasi"]
        RF_FORM[Isi Form Registrasi] --> RF_ROLE{Pilih Role}
        RF_ROLE -->|Turis| RF_TURIS[DB: status = ACTIVE]
        RF_ROLE -->|Kontributor| RF_KT[DB: status = PENDING]
        RF_TURIS --> RF_AUTO[JWT Token Diberikan ✅]
        RF_KT --> RF_WAIT[Tunggu Approval Superadmin ⏳]
        RF_AUTO --> LOGIN_SUCCESS
    end

    subgraph LOGIN_FLOW ["🔑 Alur Login"]
        LF_FORM[Isi Email & Password] --> LF_VALID{Kredensial Valid?}
        LF_VALID -->|Tidak| LF_ERR[❌ 401: Email/password salah]
        LF_VALID -->|Ya| LF_STATUS{Status Akun?}
        LF_STATUS -->|PENDING| LF_PEND[❌ 401: Menunggu persetujuan]
        LF_STATUS -->|REJECTED| LF_REJ[❌ 401: Akun ditolak]
        LF_STATUS -->|SUSPENDED| LF_SUS[❌ 401: Akun disuspend]
        LF_STATUS -->|ACTIVE| LOGIN_SUCCESS[✅ JWT Token → Redirect by Role]
    end

    LOGIN_SUCCESS --> ROLE_CHECK

    ROLE_CHECK -->|SUPERADMIN| ADMIN_FLOW
    ROLE_CHECK -->|KONTRIBUTOR| KT_FLOW
    ROLE_CHECK -->|TURIS| TURIS_FLOW

    subgraph ADMIN_FLOW ["👑 Superadmin Flow"]
        AD_HOME[/admin - Dashboard] --> AD_STATS[Lihat Statistik Platform]
        AD_HOME --> AD_PENDING[Daftar Pending Users]
        AD_PENDING --> AD_DECIDE{Approve / Reject?}
        AD_DECIDE -->|Approve| AD_ACTIVE[UPDATE status = ACTIVE]
        AD_DECIDE -->|Reject| AD_REJECT[UPDATE status = REJECTED]
        AD_HOME --> AD_CONTENT[Moderasi Destinasi PENDING]
        AD_CONTENT --> AD_DEST{Approve / Reject Destinasi?}
        AD_DEST -->|Approve| AD_PUBLISH[destStatus = PUBLISHED]
        AD_DEST -->|Reject| AD_DEST_REJ[destStatus = REJECTED]
    end

    subgraph KT_FLOW ["🏛️ Kontributor Flow"]
        KT_HOME[/kontributor - Dashboard] --> KT_LIST[Lihat Destinasi Saya]
        KT_HOME --> KT_UPLOAD[Upload Destinasi Baru]
        KT_UPLOAD --> KT_FORM[Isi Form Destinasi]
        KT_FORM --> KT_IMG[Upload Gambar Cover]
        KT_IMG --> KT_VALID{Validasi File}
        KT_VALID -->|❌ Bukan gambar OR lebih dari 5MB| KT_ERR[Error: File tidak valid]
        KT_ERR --> KT_IMG
        KT_VALID -->|✅ Valid| KT_SAVE[DB: destStatus = PENDING]
        KT_SAVE --> KT_NOTIFY[Superadmin dapat memoderasi]
    end

    subgraph TURIS_FLOW ["🧳 Turis Flow"]
        TR_HOME[Beranda - Heritage Grid] --> TR_FILTER[Filter Kategori / Provinsi]
        TR_FILTER --> TR_SEARCH[Cari Destinasi]
        TR_SEARCH --> TR_RESULT{Hasil Ditemukan?}
        TR_RESULT -->|Tidak| TR_EMPTY[EmptyState Component]
        TR_RESULT -->|Ya| TR_LIST[Heritage Cards]
        TR_LIST --> TR_DETAIL[Detail Destinasi]
        TR_DETAIL --> TR_INFO2[Info Budaya, Sejarah, Koneksi Malaysia]
        TR_DETAIL --> TR_COMPASS2[Access Compass & Level Akses]
        TR_DETAIL --> TR_WEATHER2[Cuaca Real-time]
        TR_DETAIL --> TR_SAVE[Simpan ke Journey]
        TR_SAVE --> TR_SAVED[✅ JourneyItem tersimpan di DB]
    end
```

---

## Tabel Penjelasan Fungsi Utama

| Nama Fungsi | Role Pengguna | Masukan | Penjelasan | Validasi | Keluaran |
|------------|---------------|---------|------------|----------|---------|
| **Registrasi Turis** | Turis | nama, email, password, role=TURIS | Simpan user baru ke DB dengan status ACTIVE | Email unik; password min 8 char; role valid | User ACTIVE + JWT token; redirect ke beranda |
| **Registrasi Kontributor** | Kontributor | nama, email, password, role=KONTRIBUTOR, organisasi | Simpan user baru ke DB dengan status PENDING | Email unik; password min 8 char | User PENDING; pesan "Menunggu persetujuan" |
| **Login** | Semua | email, password | Autentikasi user dan buat JWT token | Email terdaftar; password cocok; status ACTIVE | JWT token (7 hari); redirect berdasarkan role |
| **Approve Kontributor** | Superadmin | userId, status=ACTIVE | Ubah status user Kontributor menjadi ACTIVE | JWT valid; role SUPERADMIN; user dalam PENDING | User status ACTIVE; Kontributor dapat login |
| **Reject Pendaftaran** | Superadmin | userId, status=REJECTED | Tolak pendaftaran Kontributor | JWT valid; role SUPERADMIN | User status REJECTED; login gagal (401) |
| **Lihat Stats Platform** | Superadmin | — | Ambil statistik: total user, pending, destinasi | JWT valid; role SUPERADMIN | { totalUsers, pendingUsers, totalDestinations, publishedDestinations } |
| **Upload Destinasi** | Kontributor | name, city, province, categoryId, shortDesc, culturalMeaning, localHistory, malaysiaConnection, localEtiquette, coverImage | Simpan destinasi baru + gambar ke storage | JWT valid; role KONTRIBUTOR; file JPG/PNG/WebP < 5MB; field wajib tidak kosong | Destination status PENDING; file tersimpan di uploads/ |
| **Approve Destinasi** | Superadmin | destinationId, destStatus=PUBLISHED | Ubah status destinasi ke PUBLISHED | JWT valid; role SUPERADMIN | destStatus = PUBLISHED; destinasi tampil di beranda |
| **Browse Destinasi** | Public | category, province, search, page, limit | Ambil daftar destinasi PUBLISHED dengan filter & pagination | destStatus harus PUBLISHED | Paginated list: { destinations[], pagination } |
| **Lihat Detail Destinasi** | Public | slug | Ambil detail destinasi + access compass + cuaca Open-Meteo | Slug ada di DB; destStatus PUBLISHED | Detail destinasi + compass + cuaca real-time + viewCount++ |
| **Cari Destinasi** | Public | q (string pencarian) | Full-text search di nama, deskripsi, kota, provinsi, makna budaya | Minimal 1 karakter | Daftar destinasi yang cocok (bisa kosong) |
| **Simpan Journey** | Turis | destinationId | Simpan destinasi ke daftar journey pribadi | JWT valid; role TURIS; unique constraint | JourneyItem tersimpan; 409 jika sudah disimpan |
| **Lihat Destinasi Saya** | Kontributor | — | Ambil semua destinasi milik Kontributor yang login | JWT valid; role KONTRIBUTOR | List destinasi dengan status (PENDING/PUBLISHED/REJECTED) |
| **Hapus Destinasi** | Kontributor / Superadmin | destinationId | Hapus destinasi dari sistem | JWT valid; Kontributor hanya bisa hapus miliknya; Superadmin bisa semua | Destinasi dihapus; 403 jika bukan miliknya |
