# Docker Architecture Diagram — WarisanLink

```mermaid
graph TB
    subgraph INTERNET ["🌐 Internet"]
        USER["👤 User Browser\n(HTTPS)"]
        CF["☁️ Cloudflare Tunnel\nwisatalink.space"]
    end

    USER -->|"HTTPS"| CF

    subgraph VPS ["🖥️ VPS Ubuntu 24.04 LTS (host1778093653)"]
        CF -->|"HTTP → localhost:8082"| HOST8082

        HOST8082["Host Port :8082"]
        HOST5434["Host Port :5434\n(DB admin access)"]

        subgraph COMPOSE ["🐳 Docker Compose — warisan-network (bridge)"]

            subgraph FE_C ["warisan-frontend"]
                FE_SVC["nginx:1.27-alpine\nContainer Port :80\nServes: React SPA dist/"]
            end

            subgraph BE_C ["warisan-backend"]
                BE_SVC["node:20-alpine\nContainer Port :3000\nNOT exposed to host\nExpress + Prisma ORM"]
                BE_VOL[/"warisan-uploads\n(Named Volume)\nuploads/"/]
            end

            subgraph DB_C ["warisan-db"]
                DB_SVC["postgres:16-alpine\nContainer Port :5432\nNOT exposed to host"]
                DB_VOL[/"warisan-postgres-data\n(Named Volume)\n/var/lib/postgresql/data"/]
            end

        end

        HOST8082 -->|"port mapping :80"| FE_SVC
        HOST5434 -->|"port mapping :5432"| DB_SVC
        BE_SVC --- BE_VOL
        DB_SVC --- DB_VOL

        FE_SVC -->|"Proxy /api/* (HTTP internal)"| BE_SVC
        FE_SVC -->|"Proxy /uploads/*"| BE_SVC
        BE_SVC -->|"Prisma ORM / TCP"| DB_SVC

        BE_SVC -->|"healthcheck\n(depends_on: db healthy)"| DB_SVC
        FE_SVC -->|"healthcheck\n(depends_on: backend healthy)"| BE_SVC
    end

    subgraph EXTERNAL ["🔗 External APIs"]
        OPENMETEO["Open-Meteo API\nCuaca Real-time\n(Free, No API Key)"]
    end

    BE_SVC -->|"HTTP GET /v1/forecast"| OPENMETEO
```

---

## Penjelasan Komponen

| Komponen | Image | Port | Volume | Keterangan |
|----------|-------|------|--------|------------|
| **warisan-frontend** | `nginx:1.27-alpine` | 8082 → 80 | — | Multi-stage build: node build React, nginx serve static + proxy |
| **warisan-backend** | `node:20-alpine` | internal :3000 | `warisan-uploads` | Express API + Prisma. Auto-migrate saat start |
| **warisan-db** | `postgres:16-alpine` | 5434 → 5432 | `warisan-postgres-data` | PostgreSQL self-hosted, persisten via named volume |

## Alur Request

```
Browser → Cloudflare Tunnel → Host :8082 → nginx (frontend container)
                                              ├─ GET / → serve React SPA (index.html)
                                              ├─ GET /api/* → proxy → backend:3000
                                              └─ GET /uploads/* → proxy → backend:3000/uploads/
```

## Startup Order (healthcheck)

```
1. warisan-db     → healthy (pg_isready)
2. warisan-backend → healthy (setelah migrate deploy + server start)
3. warisan-frontend → running (setelah backend healthy)
```

## Cara Docker Membantu Deployment

1. **Konsistensi lingkungan** — Node.js 20, PostgreSQL 16, nginx 1.27 selalu sama di dev dan production
2. **Isolasi port** — backend tidak di-expose ke host, hanya diakses via nginx internal
3. **Persistent data** — named volumes memastikan data DB dan uploads tidak hilang saat container restart
4. **Dependency ordering** — healthcheck memastikan DB siap sebelum backend start, backend healthy sebelum frontend start
5. **Multi-stage build** — frontend image hanya berisi nginx + dist/, bukan node_modules (lebih kecil)

## Port Allocation VPS (Tidak Konflik)

| Port Host | Service | Keterangan |
|-----------|---------|------------|
| 3000 | jobtracker-prod | Proyek lain |
| 3006 | *(freed)* | Sebelumnya warisan backend non-Docker |
| **8082** | **warisan-frontend** | **Cloudflare Tunnel target** |
| **5434** | **warisan-db** | **PostgreSQL host access** |
