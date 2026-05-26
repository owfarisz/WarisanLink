# Sequence Diagram 3 — Superadmin Approve/Reject Kontributor

**Aktor:** Kontributor, Superadmin, Frontend (React), Backend (Express), Database (PostgreSQL)

---

```mermaid
sequenceDiagram
    actor KT as Kontributor
    actor SA as Superadmin
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant DB as Database (PostgreSQL)

    Note over KT,DB: FASE 1 — Registrasi Kontributor

    KT->>FE: Buka /register, pilih role "Kontributor"
    KT->>FE: Isi: nama, email, password, organisasi
    FE->>BE: POST /api/v1/auth/register<br/>  { name, email, password,<br/>    role: "KONTRIBUTOR", organization }

    BE->>BE: Zod validate: email valid, password >= 8 char ✅
    BE->>DB: SELECT user WHERE email = ?
    DB-->>BE: null (email belum terdaftar)
    BE->>BE: bcrypt.hash(password, 12)
    BE->>DB: INSERT INTO users<br/>  { role: 'KONTRIBUTOR', status: 'PENDING', ... }
    DB-->>BE: User { id, status: PENDING }

    BE-->>FE: 201 { data: { user, token: null,<br/>  message: "Menunggu persetujuan Superadmin" } }
    FE-->>KT: Toast: "Registrasi berhasil. Menunggu persetujuan admin."
    FE->>FE: Redirect ke /login

    Note over KT,DB: FASE 2A — Superadmin MENYETUJUI

    SA->>FE: Login sebagai Superadmin → redirect ke /admin
    FE->>BE: GET /api/v1/admin/users?status=PENDING<br/>  Authorization: Bearer superadmin-token
    BE->>BE: verifyToken → { userId, role: SUPERADMIN }
    BE->>BE: requireRole('SUPERADMIN') ✅
    BE->>DB: SELECT users WHERE status = 'PENDING'<br/>  ORDER BY createdAt DESC
    DB-->>BE: [{ id, name, email, role: KONTRIBUTOR, organization, ... }]
    BE-->>FE: 200 { data: { users: [KontributorX, ...] } }
    FE-->>SA: Tampilkan daftar pending users dengan tombol Setujui / Tolak

    SA->>FE: Klik "Setujui" untuk Kontributor X
    FE->>BE: PUT /api/v1/admin/users/{id}/status<br/>  { status: "ACTIVE" }
    BE->>BE: verifyToken + requireRole('SUPERADMIN') ✅
    BE->>DB: UPDATE users SET status = 'ACTIVE' WHERE id = ?
    DB-->>BE: User { status: ACTIVE }
    BE-->>FE: 200 { success: true, data: user }
    FE-->>SA: Toast: "Pengguna disetujui ✅"
    FE->>FE: Refresh daftar pending users

    Note right of KT: Kontributor kini dapat login<br/>dan mulai upload destinasi

    Note over KT,DB: FASE 2B — Superadmin MENOLAK

    SA->>FE: Klik "Tolak" untuk Kontributor Y
    FE->>BE: PUT /api/v1/admin/users/{id}/status<br/>  { status: "REJECTED" }
    BE->>DB: UPDATE users SET status = 'REJECTED' WHERE id = ?
    DB-->>BE: User { status: REJECTED }
    BE-->>FE: 200 { success: true }
    FE-->>SA: Toast: "Pengguna ditolak"

    Note right of KT: Jika Kontributor Y coba login:<br/>401 "Akun Anda ditolak. Hubungi admin."
```

---

## Penjelasan Alur

| Langkah | Komponen | Aksi |
|---------|----------|------|
| 1 | Auth Service | Registrasi Kontributor: status default = PENDING |
| 2 | Auth Service | Registrasi Turis: status default = ACTIVE (langsung login) |
| 3 | JWT | Token TIDAK diberikan saat status PENDING |
| 4 | Admin API | GET /admin/users diproteksi verifyToken + requireRole(SUPERADMIN) |
| 5 | Admin Service | PUT status: validasi tidak boleh ubah diri sendiri |
| 6 | Login | Jika status REJECTED → 401 dengan pesan spesifik |

**Keluaran approve:** User.status = ACTIVE, Kontributor dapat login dan upload destinasi.  
**Keluaran reject:** User.status = REJECTED, login dikembalikan 401 dengan code ACCOUNT_REJECTED.
