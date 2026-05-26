# Sequence Diagram 1 — Kontributor Upload Destinasi

**Aktor:** Kontributor (Produsen), Frontend (React), Backend (Express), File Storage (uploads/), Database (PostgreSQL)

---

```mermaid
sequenceDiagram
    actor KT as Kontributor
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant FS as File Storage (uploads/)
    participant DB as Database (PostgreSQL)

    Note over KT,DB: FLOW A — Upload Berhasil (Valid)

    KT->>FE: Buka /upload-destinasi
    FE->>FE: Cek token JWT di authStore (localStorage)
    FE->>BE: GET /api/v1/categories
    BE->>DB: SELECT * FROM categories
    DB-->>BE: Daftar kategori
    BE-->>FE: 200 { data: categories[] }
    FE-->>KT: Tampilkan form dengan pilihan kategori

    KT->>FE: Isi form + pilih gambar cover (foto.jpg, 2MB)
    KT->>FE: Klik "Upload Destinasi"

    FE->>FE: Client-side: cek ukuran file < 5MB ✅
    FE->>BE: POST /api/v1/destinations (multipart/form-data)<br/>  Authorization: Bearer token
    
    BE->>BE: verifyToken: decode JWT → { userId, role }
    BE->>BE: requireRole: cek role === KONTRIBUTOR ✅
    BE->>BE: Multer fileFilter: mimetype = image/jpeg ✅
    BE->>BE: Multer limits: 2MB < 5MB ✅
    BE->>FS: Simpan file ke uploads/destination-{timestamp}.jpg
    FS-->>BE: Path file tersimpan
    
    BE->>BE: Buat slug dari nama + kota
    BE->>DB: SELECT destination WHERE slug = ? (cek duplikasi)
    DB-->>BE: null (slug belum ada)
    BE->>DB: INSERT INTO destinations<br/>  (name, slug, coverImageUrl, creatorId,<br/>  destStatus='PENDING', ...)
    DB-->>BE: Destination { id, slug, destStatus: PENDING }
    
    BE-->>FE: 201 { success: true, data: destination }
    FE-->>KT: Toast sukses: "Destinasi berhasil diunggah! Menunggu persetujuan admin."
    FE->>FE: Redirect ke /kontributor

    Note over KT,DB: FLOW B — Upload Gagal (File Tidak Valid)

    KT->>FE: Pilih file foto_besar.jpg (7MB)
    KT->>FE: Klik "Upload Destinasi"

    FE->>FE: Client-side: cek ukuran 7MB > 5MB ❌
    FE-->>KT: Toast error: "Ukuran gambar maksimal 5MB"
    Note right of FE: Request TIDAK dikirim ke server

    KT->>FE: Pilih file dokumen.pdf (2MB)
    KT->>FE: Klik "Upload Destinasi"
    FE->>BE: POST /api/v1/destinations (multipart)<br/>  file: dokumen.pdf (application/pdf)
    BE->>BE: verifyToken & requireRole ✅
    BE->>BE: Multer fileFilter: mimetype = application/pdf ❌
    BE-->>FE: 400 { error: "Hanya file gambar JPG, PNG, atau WebP yang diizinkan" }
    FE-->>KT: Toast error: pesan dari server
```

---

## Penjelasan Alur

| Langkah | Komponen | Aksi |
|---------|----------|------|
| 1 | Frontend | Cek JWT di localStorage sebelum render form |
| 2 | Backend | verifyToken middleware decode JWT |
| 3 | Backend | requireRole middleware cek role KONTRIBUTOR |
| 4 | Multer | Validasi tipe file (whitelist: jpg, png, webp) |
| 5 | Multer | Validasi ukuran file (maks 5MB) |
| 6 | File Storage | Simpan file ke direktori uploads/ |
| 7 | Database | INSERT destinasi dengan status PENDING |
| 8 | Frontend | Redirect ke dashboard Kontributor |

**Keluaran valid:** Destinasi dengan `destStatus = PENDING` tersimpan di DB, file gambar tersimpan di `uploads/`.  
**Keluaran tidak valid:** Error 400 dengan pesan deskriptif, tidak ada perubahan di DB atau storage.
