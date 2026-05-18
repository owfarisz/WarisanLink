# WARISAN LINK

Platform Eksplorasi Warisan Budaya Indonesia-Malaysia

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Query
- **Backend:** Node.js + Express.js + Prisma + PostgreSQL 16
- **Map:** Leaflet.js + OpenStreetMap
- **External APIs (Free & Open Source):**
  - **Open-Meteo** — Weather data real-time
  - **Nominatim (OSM)** — Reverse geocoding
  - **OSRM** — Routing & distance calculation

## Quick Start

### 1. Start Database

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Features

- **Heritage Discover** — Browse 15+ pre-seeded Indonesian heritage destinations
- **Access Compass** — Real-time weather, routing distance, entry points, travel tips
- **Visit History** — Track destinations you've viewed (localStorage + DB)
- **Search & Filter** — By category, province, access level, or keyword
- **Interactive Maps** — Leaflet + OpenStreetMap with gateway-to-destination route lines

## External APIs Used

| API | Purpose | Cost |
|-----|---------|------|
| [Open-Meteo](https://open-meteo.com/) | Real-time weather data | Free, no API key |
| [Nominatim](https://nominatim.openstreetmap.org/) | Reverse geocoding | Free, no API key |
| [OSRM](http://project-osrm.org/) | Routing & distance | Free, no API key |

## Pre-seeded Destinations

15 real Indonesian heritage destinations with Malaysia connections:
- Pulau Penyengat, Istana Maimun, Masjid Raya Baiturrahman
- Kota Tua Jakarta, Keraton Yogyakarta, Candi Borobudur
- Tana Toraja, Desa Wae Rebo, Rumah Gadang Bukittinggi
- Dan 6 destinasi lainnya

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required variables.

## License

MIT
