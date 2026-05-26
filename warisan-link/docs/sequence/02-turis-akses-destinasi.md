# Sequence Diagram 2 — Turis Akses Destinasi

**Aktor:** Turis (Konsumen), Frontend (React), Backend (Express), Database (PostgreSQL), Weather API (Open-Meteo)

---

```mermaid
sequenceDiagram
    actor TR as Turis
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant DB as Database (PostgreSQL)
    participant WA as Weather API (Open-Meteo)

    Note over TR,WA: FLOW A — Browse & Lihat Detail Destinasi (Valid)

    TR->>FE: Buka https://wisatalink.space
    FE->>BE: GET /api/v1/destinations?page=1&limit=12
    BE->>DB: SELECT * FROM destinations<br/>  WHERE destStatus = 'PUBLISHED'<br/>  ORDER BY createdAt DESC LIMIT 12
    DB-->>BE: destinations[], total
    BE-->>FE: 200 { data: { destinations[], pagination } }
    FE-->>TR: Tampilkan Heritage Cards (grid 12 item)

    TR->>FE: Klik filter "Kategori: Candi"
    FE->>BE: GET /api/v1/destinations?category=candi
    BE->>DB: SELECT destinations JOIN categories<br/>  WHERE category.slug = 'candi'<br/>  AND destStatus = 'PUBLISHED'
    DB-->>BE: Filtered destinations
    BE-->>FE: 200 { data: ... }
    FE-->>TR: Update grid dengan hasil filter

    TR->>FE: Klik kartu "Candi Borobudur"
    FE->>BE: GET /api/v1/destinations/candi-borobudur-magelang
    BE->>DB: SELECT * FROM destinations WHERE slug = ?<br/>  INCLUDE accessCompass
    DB-->>BE: Destination detail + compass data

    BE->>DB: UPDATE destinations<br/>  SET viewCount = viewCount + 1 WHERE id = ?
    DB-->>BE: Updated (background)

    BE->>WA: GET /v1/forecast?latitude=-7.6079&longitude=110.2038<br/>  &current=temperature_2m,wind_speed_10m,precipitation
    WA-->>BE: { current: { temperature_2m: 28.4, wind_speed_10m: 12, ... } }

    BE-->>FE: 200 { data: { destination, compass, weather } }
    FE-->>TR: Tampilkan halaman detail:<br/>  - Info budaya & sejarah<br/>  - Koneksi Malaysia<br/>  - Access Compass (gateway, jarak, level)<br/>  - Cuaca real-time (suhu, angin, hujan)<br/>  - Peta Leaflet (OpenStreetMap)

    Note over TR,WA: FLOW B — Pencarian Tidak Menemukan Hasil

    TR->>FE: Ketik "kastil gotik eropa" di search bar
    FE->>BE: GET /api/v1/destinations?search=kastil+gotik+eropa
    BE->>DB: SELECT * FROM destinations<br/>  WHERE (name ILIKE '%kastil gotik eropa%'<br/>    OR shortDesc ILIKE '%kastil gotik eropa%'<br/>    OR city ILIKE '...'<br/>    OR culturalMeaning ILIKE '...')<br/>  AND destStatus = 'PUBLISHED'
    DB-->>BE: [] (empty array), total: 0
    BE-->>FE: 200 { data: { destinations: [], pagination: { total: 0 } } }
    FE-->>TR: Tampilkan EmptyState:<br/>  "Tidak ada destinasi ditemukan untuk<br/>  'kastil gotik eropa'"
```

---

## Penjelasan Alur

| Langkah | Komponen | Aksi |
|---------|----------|------|
| 1 | Backend | Filter `destStatus = PUBLISHED` — hanya konten yang sudah diapprove Superadmin |
| 2 | Backend | Pagination: skip/take dengan default 12 per halaman |
| 3 | Backend | `viewCount++` setiap kali halaman detail dibuka |
| 4 | Open-Meteo | Fetch cuaca real-time berdasarkan koordinat GPS dari Access Compass |
| 5 | Frontend | Render peta Leaflet dengan marker di koordinat destinasi |
| 6 | Backend | Full-text search di 5 field: name, shortDesc, city, province, culturalMeaning |

**Keluaran valid:** Halaman detail destinasi dengan info budaya, compass, cuaca aktual, dan peta interaktif.  
**Keluaran tidak valid (search):** EmptyState component dengan pesan informatif.

**Fitur unik WarisanLink:**
- Cuaca real-time via Open-Meteo API (gratis, tanpa API key)
- Narasi koneksi budaya Indonesia–Malaysia
- Access Compass: panduan akses transportasi + level kesulitan (EASY / MODERATE / REMOTE)
