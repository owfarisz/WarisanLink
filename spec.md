# WARISAN LINK — Full Technical Specification

> Platform Eksplorasi Warisan Budaya Indonesia-Malaysia  
> Stack: React + Node.js + MySQL | Self-hosted VPS | 100% Open Source & Free

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [File Structure](#4-file-structure)
5. [Database Schema](#5-database-schema)
6. [API Specification](#6-api-specification)
7. [Frontend Pages & Components](#7-frontend-pages--components)
8. [Authentication & Role System](#8-authentication--role-system)
9. [Feature Spec: Heritage Discover](#9-feature-spec-heritage-discover)
10. [Feature Spec: Access Compass](#10-feature-spec-access-compass)
11. [Feature Spec: Contributor System](#11-feature-spec-contributor-system)
12. [Feature Spec: Journey List (Save)](#12-feature-spec-journey-list-save)
13. [Admin Panel Spec](#13-admin-panel-spec)
14. [VPS Deployment Guide](#14-vps-deployment-guide)
15. [Environment Variables](#15-environment-variables)
16. [Security Checklist](#16-security-checklist)

---

## 1. Project Overview

**WARISAN LINK** adalah platform web yang membantu traveler (terutama dari Malaysia) menemukan hidden gems budaya di Indonesia melalui:

- Cerita lokal terverifikasi
- Hubungan historis Indonesia-Malaysia
- Panduan akses (Access Compass)
- Sistem kontributor lokal

### User Roles

| Role | Deskripsi |
|------|-----------|
| `guest` | Browsing tanpa login |
| `traveler` | Login, bisa save journey |
| `contributor` | Login, bisa submit destinasi |
| `admin` | Full access, verifikasi konten |

---

## 2. Tech Stack

Semua tools **free & open source**, tidak ada dependency ke provider berbayar.

### Backend

| Kebutuhan | Tool | Alasan |
|-----------|------|--------|
| Runtime | **Node.js 20 LTS** | Gratis, ekosistem luas |
| Framework | **Express.js** | Ringan, fleksibel |
| Database | **MySQL 8** | Free, robust untuk relational data |
| ORM | **Prisma** | Type-safe, migration tool bagus |
| Auth | **JWT + bcryptjs** | Stateless, tidak perlu session store |
| File Upload | **Multer** | Local disk upload |
| Image Processing | **Sharp** | Resize & compress gambar |
| Email | **Nodemailer + self-hosted SMTP (Postfix)** | Free, tidak pakai Sendgrid dll |
| Rate Limiting | **express-rate-limit** | Proteksi brute force |
| Validation | **Zod** | Schema validation |
| Logging | **Winston** | Structured logging |
| Process Manager | **PM2** | Keep alive di VPS |

### Frontend

| Kebutuhan | Tool | Alasan |
|-----------|------|--------|
| Framework | **React 18 + Vite** | Fast build, modern |
| Routing | **React Router v6** | Client-side routing |
| State | **Zustand** | Ringan, simple |
| Data Fetching | **TanStack Query (React Query)** | Caching, loading states |
| Styling | **Tailwind CSS** | Utility-first, tidak perlu CSS files |
| UI Components | **shadcn/ui** | Copy-paste, tidak ada dependency lock-in |
| Map | **Leaflet.js + React-Leaflet** | Free, tidak pakai Google Maps |
| Map Tiles | **OpenStreetMap** | 100% gratis |
| Icons | **Lucide React** | Open source icon set |
| Form | **React Hook Form + Zod** | Validasi frontend |
| Toast | **Sonner** | Notifikasi ringan |

### Infrastructure (VPS)

| Kebutuhan | Tool |
|-----------|------|
| Web Server / Reverse Proxy | **Nginx** |
| SSL | **Certbot (Let's Encrypt)** |
| DB Server | **MySQL 8** |
| Process Manager | **PM2** |
| OS | **Ubuntu 22.04 LTS** |
| Firewall | **UFW** |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        VPS (Ubuntu 22.04)                │
│                                                         │
│  ┌────────────┐     ┌──────────────────────────────┐   │
│  │   Nginx    │────▶│  Frontend (React/Vite)        │   │
│  │  :80/:443  │     │  /var/www/warisan-link/dist   │   │
│  └─────┬──────┘     └──────────────────────────────┘   │
│        │                                                │
│        │ /api/*     ┌──────────────────────────────┐   │
│        └───────────▶│  Backend (Express.js)         │   │
│                     │  localhost:5000 (PM2)         │   │
│                     └──────────────┬───────────────┘   │
│                                    │                    │
│                     ┌──────────────▼───────────────┐   │
│                     │  MySQL 8                      │   │
│                     │  localhost:3306               │   │
│                     └──────────────────────────────┘   │
│                                                         │
│  /var/www/warisan-link/uploads  (static file storage)  │
└─────────────────────────────────────────────────────────┘
```

**Request Flow:**
```
Browser → Nginx (:443) → Static Files (React)
Browser → Nginx (:443/api/*) → Express.js (:5000) → MySQL
```

---

## 4. File Structure

```
warisan-link/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                  # Prisma client instance
│   │   │   ├── env.js                 # Env validation with Zod
│   │   │   └── upload.js              # Multer config
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js     # JWT verify, role check
│   │   │   ├── error.middleware.js    # Global error handler
│   │   │   ├── rateLimiter.js         # express-rate-limit config
│   │   │   └── validate.js            # Zod request validation
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   └── auth.schema.js     # Zod schemas
│   │   │   │
│   │   │   ├── destinations/
│   │   │   │   ├── destination.controller.js
│   │   │   │   ├── destination.service.js
│   │   │   │   ├── destination.routes.js
│   │   │   │   └── destination.schema.js
│   │   │   │
│   │   │   ├── access-compass/
│   │   │   │   ├── compass.controller.js
│   │   │   │   ├── compass.service.js
│   │   │   │   └── compass.routes.js
│   │   │   │
│   │   │   ├── journeys/
│   │   │   │   ├── journey.controller.js
│   │   │   │   ├── journey.service.js
│   │   │   │   └── journey.routes.js
│   │   │   │
│   │   │   ├── contributors/
│   │   │   │   ├── contributor.controller.js
│   │   │   │   ├── contributor.service.js
│   │   │   │   └── contributor.routes.js
│   │   │   │
│   │   │   ├── categories/
│   │   │   │   ├── category.controller.js
│   │   │   │   ├── category.service.js
│   │   │   │   └── category.routes.js
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── admin.controller.js
│   │   │       ├── admin.service.js
│   │   │       └── admin.routes.js
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js                 # sign, verify helpers
│   │   │   ├── hash.js                # bcrypt helpers
│   │   │   ├── mailer.js              # Nodemailer setup
│   │   │   ├── slugify.js             # URL slug generator
│   │   │   ├── paginate.js            # Pagination helper
│   │   │   └── logger.js              # Winston logger
│   │   │
│   │   └── app.js                     # Express app entry point
│   │
│   ├── prisma/
│   │   ├── schema.prisma              # DB models
│   │   └── migrations/                # Auto-generated migrations
│   │
│   ├── uploads/                       # Uploaded images (served by Nginx)
│   ├── logs/                          # Winston log files
│   ├── .env                           # Environment variables
│   ├── .env.example
│   ├── package.json
│   └── server.js                      # Entry point (import app.js)
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── og-image.png
│   │
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js               # Axios instance + interceptors
│   │   │   ├── auth.api.js
│   │   │   ├── destinations.api.js
│   │   │   ├── compass.api.js
│   │   │   ├── journeys.api.js
│   │   │   └── admin.api.js
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   │   ├── button.jsx
│   │   │   │   ├── card.jsx
│   │   │   │   ├── badge.jsx
│   │   │   │   ├── dialog.jsx
│   │   │   │   ├── input.jsx
│   │   │   │   ├── select.jsx
│   │   │   │   ├── textarea.jsx
│   │   │   │   ├── toast.jsx
│   │   │   │   └── skeleton.jsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Sidebar.jsx        # Admin sidebar
│   │   │   │   └── PageWrapper.jsx
│   │   │   │
│   │   │   ├── heritage/
│   │   │   │   ├── HeritageCard.jsx   # Destination card
│   │   │   │   ├── HeritageGrid.jsx   # Grid of cards
│   │   │   │   ├── HeritageBadge.jsx  # Category badge
│   │   │   │   ├── VerifiedBadge.jsx
│   │   │   │   └── CategoryFilter.jsx
│   │   │   │
│   │   │   ├── compass/
│   │   │   │   ├── CompassCard.jsx    # Access info card
│   │   │   │   ├── AccessLevelBadge.jsx
│   │   │   │   └── MapView.jsx        # Leaflet map
│   │   │   │
│   │   │   ├── journey/
│   │   │   │   ├── JourneyList.jsx
│   │   │   │   └── SaveButton.jsx
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── SearchBar.jsx
│   │   │       ├── Pagination.jsx
│   │   │       ├── LoadingSpinner.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       └── ProtectedRoute.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Discover.jsx           # Heritage Discover page
│   │   │   ├── DestinationDetail.jsx  # Single destination
│   │   │   ├── JourneyList.jsx        # Saved journeys
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ContributorDashboard.jsx
│   │   │   ├── SubmitDestination.jsx  # Contributor submit form
│   │   │   ├── EditDestination.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminDestinations.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       └── AdminCategories.jsx
│   │   │
│   │   ├── store/
│   │   │   ├── authStore.js           # Zustand: user session
│   │   │   └── journeyStore.js        # Zustand: saved journeys
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useDestinations.js     # React Query hooks
│   │   │   ├── useJourney.js
│   │   │   └── useCompass.js
│   │   │
│   │   ├── lib/
│   │   │   ├── utils.js               # cn(), formatDate(), etc.
│   │   │   └── constants.js           # CATEGORIES, ACCESS_LEVELS, etc.
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── nginx/
│   └── warisan-link.conf              # Nginx config template
│
├── scripts/
│   ├── deploy.sh                      # Deploy script
│   └── backup-db.sh                   # MySQL backup cron script
│
├── .gitignore
└── README.md
```

---

## 5. Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// USERS
// ─────────────────────────────────────────

model User {
  id            Int          @id @default(autoincrement())
  email         String       @unique @db.VarChar(255)
  password      String       @db.VarChar(255)
  name          String       @db.VarChar(150)
  role          Role         @default(TRAVELER)
  isVerified    Boolean      @default(false)
  verifyToken   String?      @db.VarChar(255)
  resetToken    String?      @db.VarChar(255)
  resetExpiry   DateTime?
  avatarUrl     String?      @db.VarChar(500)
  country       String?      @db.VarChar(100)    // e.g. "Malaysia"
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // Relations
  contributor   Contributor?
  journeyItems  JourneyItem[]

  @@index([email])
}

enum Role {
  GUEST
  TRAVELER
  CONTRIBUTOR
  ADMIN
}

// ─────────────────────────────────────────
// CONTRIBUTOR PROFILE
// ─────────────────────────────────────────

model Contributor {
  id            Int           @id @default(autoincrement())
  userId        Int           @unique
  bio           String?       @db.Text
  region        String?       @db.VarChar(150)   // Area of expertise
  isVerified    Boolean       @default(false)
  badge         String?       @db.VarChar(100)   // e.g. "Verified Local Expert"
  totalApproved Int           @default(0)
  createdAt     DateTime      @default(now())

  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  destinations  Destination[]
}

// ─────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────

model Category {
  id            Int           @id @default(autoincrement())
  name          String        @unique @db.VarChar(100)
  slug          String        @unique @db.VarChar(100)
  description   String?       @db.Text
  iconName      String?       @db.VarChar(50)    // Lucide icon name
  colorHex      String?       @db.VarChar(7)     // e.g. "#e2b96f"
  createdAt     DateTime      @default(now())

  destinations  Destination[]
}

// ─────────────────────────────────────────
// DESTINATIONS (Heritage Cards)
// ─────────────────────────────────────────

model Destination {
  id                Int            @id @default(autoincrement())
  slug              String         @unique @db.VarChar(200)
  name              String         @db.VarChar(200)
  city              String         @db.VarChar(100)
  province          String         @db.VarChar(100)
  categoryId        Int
  shortDesc         String         @db.VarChar(500)
  culturalMeaning   String         @db.Text
  localHistory      String         @db.Text
  malaysiaConnection String        @db.Text        // Koneksi budaya dengan Malaysia
  localEtiquette    String?        @db.Text
  coverImageUrl     String?        @db.VarChar(500)
  galleryUrls       Json?                          // String[] stored as JSON
  status            DestinationStatus @default(DRAFT)
  contributorId     Int?
  verifiedAt        DateTime?
  verifiedBy        Int?                           // Admin user ID
  viewCount         Int            @default(0)
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  category          Category       @relation(fields: [categoryId], references: [id])
  contributor       Contributor?   @relation(fields: [contributorId], references: [id])
  accessCompass     AccessCompass?
  journeyItems      JourneyItem[]

  @@index([status])
  @@index([categoryId])
  @@index([province])
  @@fulltext([name, shortDesc, city, province])
}

enum DestinationStatus {
  DRAFT
  PENDING
  VERIFIED
  REJECTED
}

// ─────────────────────────────────────────
// ACCESS COMPASS
// ─────────────────────────────────────────

model AccessCompass {
  id                Int          @id @default(autoincrement())
  destinationId     Int          @unique
  nearestGateway    String       @db.VarChar(200)  // e.g. "Bandara Sultan Syarif Kasim II, Pekanbaru"
  entryPoint        String?      @db.VarChar(300)  // e.g. "Malaysia → Batam → Tanjung Pinang"
  distanceKm        Float?                         // Estimated distance from gateway
  accessLevel       AccessLevel  @default(MODERATE)
  weatherSummary    String?      @db.VarChar(500)
  bestTimeToVisit   String?      @db.VarChar(300)
  travelNotes       String?      @db.Text
  safetyNotes       String?      @db.Text
  latitude          Decimal?     @db.Decimal(10, 8)
  longitude         Decimal?     @db.Decimal(11, 8)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  destination       Destination  @relation(fields: [destinationId], references: [id], onDelete: Cascade)
}

enum AccessLevel {
  EASY
  MODERATE
  REMOTE
}

// ─────────────────────────────────────────
// JOURNEY LIST (Saved by Traveler)
// ─────────────────────────────────────────

model JourneyItem {
  id            Int         @id @default(autoincrement())
  userId        Int
  destinationId Int
  note          String?     @db.VarChar(500)
  savedAt       DateTime    @default(now())

  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Cascade)

  @@unique([userId, destinationId])
  @@index([userId])
}
```

---

## 6. API Specification

**Base URL:** `https://yourdomain.com/api/v1`

All protected endpoints require header:
```
Authorization: Bearer <access_token>
```

---

### 6.1 Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register traveler atau contributor |
| POST | `/auth/login` | Public | Login, returns JWT |
| POST | `/auth/logout` | Bearer | Invalidate token |
| GET | `/auth/verify-email` | Public | `?token=xxx` verify email |
| POST | `/auth/forgot-password` | Public | Kirim reset link |
| POST | `/auth/reset-password` | Public | Submit new password |
| GET | `/auth/me` | Bearer | Get current user profile |
| PUT | `/auth/me` | Bearer | Update profile |

**POST /auth/register**
```json
Request:
{
  "name": "Ahmad Razif",
  "email": "ahmad@email.com",
  "password": "Min8Chars!",
  "role": "TRAVELER",   // or "CONTRIBUTOR"
  "country": "Malaysia"
}

Response 201:
{
  "message": "Registrasi berhasil. Cek email untuk verifikasi.",
  "userId": 12
}
```

**POST /auth/login**
```json
Request:
{
  "email": "ahmad@email.com",
  "password": "Min8Chars!"
}

Response 200:
{
  "accessToken": "eyJ...",
  "user": {
    "id": 12,
    "name": "Ahmad Razif",
    "email": "ahmad@email.com",
    "role": "TRAVELER",
    "country": "Malaysia"
  }
}
```

---

### 6.2 Destinations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/destinations` | Public | List semua destinasi VERIFIED |
| GET | `/destinations/:slug` | Public | Detail destinasi |
| GET | `/destinations/search` | Public | Full-text search |
| POST | `/destinations` | Contributor | Submit destinasi baru |
| PUT | `/destinations/:id` | Contributor (own) | Update destinasi |
| DELETE | `/destinations/:id` | Admin | Hapus destinasi |

**GET /destinations** — Query params:
```
?category=malay-heritage
?province=Riau
?accessLevel=EASY
?search=penyengat
?page=1&limit=12
?sort=newest|popular
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "pulau-penyengat",
      "name": "Pulau Penyengat",
      "city": "Tanjung Pinang",
      "province": "Kepulauan Riau",
      "category": {
        "name": "Malay Heritage",
        "slug": "malay-heritage",
        "colorHex": "#e2b96f"
      },
      "shortDesc": "Pulau bersejarah bekas pusat Kesultanan Riau-Lingga...",
      "coverImageUrl": "/uploads/destinations/pulau-penyengat-cover.jpg",
      "status": "VERIFIED",
      "contributor": {
        "name": "Siti Rahmah",
        "badge": "Verified Local Expert"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 48,
    "totalPages": 4
  }
}
```

**POST /destinations** — Multipart form (contributor only):
```
Fields:
  name, city, province, categoryId,
  shortDesc, culturalMeaning, localHistory,
  malaysiaConnection, localEtiquette
Files:
  coverImage (1 file, max 5MB)
  gallery (max 5 files, max 5MB each)
```

---

### 6.3 Access Compass

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/compass/:destinationSlug` | Public | Get compass data for destination |
| POST | `/compass/:destinationId` | Contributor (own dest) | Add compass data |
| PUT | `/compass/:destinationId` | Contributor (own dest) | Update compass data |

**GET /compass/:destinationSlug — Response 200:**
```json
{
  "nearestGateway": "Bandara Raja Haji Fisabilillah, Tanjung Pinang",
  "entryPoint": "Malaysia → Ferry Batam → Ferry Tanjung Pinang",
  "distanceKm": 15,
  "accessLevel": "EASY",
  "weatherSummary": "Tropis, suhu 25–33°C, hujan Jan–Mar",
  "bestTimeToVisit": "April–September (musim kemarau)",
  "travelNotes": "Ferry tersedia dari Batam Centre setiap 1 jam...",
  "safetyNotes": "Patuhi aturan memasuki masjid, gunakan pakaian sopan.",
  "latitude": 0.9267,
  "longitude": 104.4667
}
```

---

### 6.4 Journey List

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/journeys` | Bearer | Get saved destinations user |
| POST | `/journeys` | Bearer | Save destinasi |
| DELETE | `/journeys/:destinationId` | Bearer | Remove dari journey |

**POST /journeys:**
```json
Request:
{ "destinationId": 7, "note": "Mau visit bulan 9" }

Response 201:
{ "message": "Destinasi disimpan ke journey list." }
```

---

### 6.5 Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | Public | List semua kategori |
| POST | `/categories` | Admin | Tambah kategori |
| PUT | `/categories/:id` | Admin | Update kategori |
| DELETE | `/categories/:id` | Admin | Hapus kategori |

---

### 6.6 Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/destinations` | Admin | List semua destinasi (all status) |
| PATCH | `/admin/destinations/:id/status` | Admin | Update status |
| GET | `/admin/users` | Admin | List semua users |
| PATCH | `/admin/users/:id/role` | Admin | Update role user |
| GET | `/admin/stats` | Admin | Dashboard stats |

**PATCH /admin/destinations/:id/status:**
```json
Request:
{
  "status": "VERIFIED",   // DRAFT | PENDING | VERIFIED | REJECTED
  "note": "Konten sudah sesuai standar verifikasi."
}
```

---

## 7. Frontend Pages & Components

### 7.1 Pages & Routes

```
/                           → Home.jsx
/discover                   → Discover.jsx (Heritage Discover)
/destination/:slug          → DestinationDetail.jsx
/journey                    → JourneyList.jsx (Protected: Traveler+)
/login                      → Login.jsx
/register                   → Register.jsx
/contributor/dashboard      → ContributorDashboard.jsx (Protected: Contributor)
/contributor/submit         → SubmitDestination.jsx (Protected: Contributor)
/contributor/edit/:id       → EditDestination.jsx (Protected: Contributor)
/admin                      → AdminDashboard.jsx (Protected: Admin)
/admin/destinations         → AdminDestinations.jsx (Protected: Admin)
/admin/users                → AdminUsers.jsx (Protected: Admin)
/admin/categories           → AdminCategories.jsx (Protected: Admin)
```

### 7.2 Key Component Behaviors

**HeritageCard.jsx**
- Tampilkan: cover image, nama, kota/provinsi, category badge, short desc, status badge
- Hover: slight scale + shadow
- Button: "Lihat Detail" + SaveButton (jika login)

**MapView.jsx (Leaflet)**
- Provider tiles: OpenStreetMap (gratis)
- Marker dengan custom icon per accessLevel
- Popup menampilkan nama destinasi + link detail

**CategoryFilter.jsx**
- Horizontal scrollable chips
- Active state highlight
- Setiap chip klik → filter `/discover?category=slug`

**SaveButton.jsx**
- Jika belum login → redirect ke /login
- Toggle: saved / unsaved (optimistic update)
- Pakai React Query mutation

---

## 8. Authentication & Role System

### JWT Strategy

```
Access Token:
  - Expires: 7d
  - Payload: { sub: userId, role, email }
  - Stored: localStorage (frontend)

Refresh: tidak diperlukan untuk MVP; re-login setelah expired
```

### Middleware: auth.middleware.js

```javascript
// Roles hierarchy:
// ADMIN > CONTRIBUTOR > TRAVELER > GUEST

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid atau expired' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
```

### Usage on Routes

```javascript
// Public
router.get('/destinations', getDestinations);

// Traveler+
router.post('/journeys', requireAuth, requireRole('TRAVELER', 'CONTRIBUTOR', 'ADMIN'), saveJourney);

// Contributor+
router.post('/destinations', requireAuth, requireRole('CONTRIBUTOR', 'ADMIN'), submitDestination);

// Admin only
router.patch('/admin/destinations/:id/status', requireAuth, requireRole('ADMIN'), updateStatus);
```

---

## 9. Feature Spec: Heritage Discover

### Search & Filter Logic (Backend)

```javascript
// destination.service.js
async function getDestinations({ category, province, accessLevel, search, page, limit, sort }) {
  const where = {
    status: 'VERIFIED',
    ...(category && { category: { slug: category } }),
    ...(province && { province }),
    ...(accessLevel && { accessCompass: { accessLevel } }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { shortDesc: { contains: search } },
        { city: { contains: search } },
        { province: { contains: search } },
      ]
    })
  };

  const orderBy = sort === 'popular'
    ? { viewCount: 'desc' }
    : { createdAt: 'desc' };

  const [data, total] = await Promise.all([
    prisma.destination.findMany({
      where, orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true, contributor: { include: { user: true } } }
    }),
    prisma.destination.count({ where })
  ]);

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
```

### Heritage Card Data

Setiap destination detail page menampilkan:

| Section | Data |
|---------|------|
| Header | Nama, Lokasi, Category Badge, Status Badge |
| Cover Image | Full-width hero |
| Cerita Singkat | `shortDesc` |
| Makna Budaya | `culturalMeaning` |
| Sejarah Lokal | `localHistory` |
| Koneksi Malaysia | `malaysiaConnection` (highlighted box) |
| Etika Lokal | `localEtiquette` (dos & don'ts format) |
| Kontributor | Avatar, nama, badge verifikasi |
| Access Compass | Embed komponen AccessCompass |
| Gallery | Image grid lightbox |
| Save Button | Persistent |

---

## 10. Feature Spec: Access Compass

Ditampilkan sebagai section di halaman detail destinasi.

### UI Layout

```
┌────────────────────────────────────────────┐
│  🧭 Access Compass                          │
├──────────────────┬─────────────────────────┤
│ Gateway Terdekat │ Batam / Tanjung Pinang   │
│ Entry Point      │ Malaysia → Batam → ...  │
│ Jarak            │ ~15 km dari gateway      │
│ Tingkat Akses    │ 🟢 EASY                  │
│ Cuaca            │ Tropis, 25–33°C          │
│ Best Time        │ April – September        │
├──────────────────┴─────────────────────────┤
│  🗺️  [Leaflet Map — Marker lokasi]         │
├────────────────────────────────────────────┤
│  📝 Travel Notes                            │
│  ⚠️  Safety & Etiquette                     │
└────────────────────────────────────────────┘
```

### Access Level Color Coding

| Level | Color | Label |
|-------|-------|-------|
| EASY | Green `#22c55e` | Mudah dijangkau |
| MODERATE | Amber `#f59e0b` | Perlu perencanaan |
| REMOTE | Red `#ef4444` | Perjalanan khusus |

---

## 11. Feature Spec: Contributor System

### Alur Contributor

```
1. Register dengan role CONTRIBUTOR
2. Verifikasi email
3. Isi profil contributor (bio, region)
4. Submit destinasi (status: DRAFT → PENDING)
5. Admin review → VERIFIED / REJECTED
6. Jika VERIFIED: destinasi muncul di platform
7. Contributor dapat badge berdasarkan total approved
```

### Badge System

| Badge | Syarat |
|-------|--------|
| New Contributor | 0 approved |
| Local Explorer | 1–3 approved |
| Cultural Guide | 4–9 approved |
| Verified Local Expert | 10+ approved |

### Form Submit Destinasi

Fields wajib:
- Nama destinasi
- Kota & provinsi
- Kategori (select dari list)
- Deskripsi singkat (max 500 karakter)
- Makna budaya
- Sejarah lokal
- Koneksi Malaysia *(field khusus WARISAN LINK)*
- Etika lokal
- Cover image (max 5MB, JPG/PNG/WEBP)

Fields opsional:
- Gallery (max 5 foto)
- Access Compass data

---

## 12. Feature Spec: Journey List (Save)

### Behavior

- Traveler & Contributor bisa save destinasi
- Save/unsave toggle dengan optimistic UI
- Journey list tampil di `/journey` page
- Bisa tambah catatan personal per destinasi
- Sorting: terbaru tersimpan / alphabetical

### UI Journey Page

```
My Journey List (12 destinasi disimpan)

[Filter: All | Riau | Jawa | Sumatra]

┌──────────────────────────────────────────┐
│ [Cover]  Pulau Penyengat                 │
│          Tanjung Pinang, Kepulauan Riau  │
│          Malay Heritage | 🟢 Easy        │
│          📝 "Mau visit bulan 9"          │
│          [Lihat Detail] [Hapus]          │
└──────────────────────────────────────────┘
```

---

## 13. Admin Panel Spec

### Dashboard Stats

```json
GET /admin/stats → {
  "totalDestinations": 120,
  "byStatus": {
    "DRAFT": 10,
    "PENDING": 8,
    "VERIFIED": 95,
    "REJECTED": 7
  },
  "totalUsers": 540,
  "totalContributors": 35,
  "totalJourneySaves": 1280,
  "topCategories": [
    { "name": "Malay Heritage", "count": 38 },
    { "name": "Islamic History", "count": 22 }
  ]
}
```

### Destination Review Flow

1. Admin masuk ke `/admin/destinations?status=PENDING`
2. Klik destinasi → lihat full detail + konten contributor
3. Pilih: **VERIFY** atau **REJECT** (dengan catatan alasan)
4. Status terupdate, contributor dapat notifikasi email

---

## 14. VPS Deployment Guide

### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Install PM2
sudo npm install -g pm2
```

### MySQL Setup

```sql
-- Jalankan di MySQL root
CREATE DATABASE warisan_link CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'warisan_user'@'localhost' IDENTIFIED BY 'StrongPassword!123';
GRANT ALL PRIVILEGES ON warisan_link.* TO 'warisan_user'@'localhost';
FLUSH PRIVILEGES;
```

### Nginx Config (`nginx/warisan-link.conf`)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend (React build)
    root /var/www/warisan-link/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # SPA fallback
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded images
    location /uploads/ {
        alias /var/www/warisan-link/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    client_max_body_size 20M;   # Untuk upload gambar
}
```

### Deploy Script (`scripts/deploy.sh`)

```bash
#!/bin/bash
set -e

APP_DIR="/var/www/warisan-link"
REPO="git@github.com:yourusername/warisan-link.git"

echo "=== Pulling latest code ==="
cd $APP_DIR
git pull origin main

echo "=== Installing backend dependencies ==="
cd $APP_DIR/backend
npm install --production

echo "=== Running Prisma migrations ==="
npx prisma migrate deploy

echo "=== Building frontend ==="
cd $APP_DIR/frontend
npm install
npm run build

echo "=== Copying build to web root ==="
cp -r dist/* $APP_DIR/dist/

echo "=== Restarting backend (PM2) ==="
pm2 restart warisan-backend || pm2 start $APP_DIR/backend/server.js --name warisan-backend

echo "=== Reloading Nginx ==="
sudo nginx -t && sudo systemctl reload nginx

echo "=== Deploy selesai! ==="
```

### PM2 Startup

```bash
# Jalankan pertama kali
pm2 start backend/server.js --name warisan-backend
pm2 save
pm2 startup  # Ikuti instruksi yang muncul
```

### Database Backup (`scripts/backup-db.sh`)

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/warisan-link"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u warisan_user -p'StrongPassword!123' warisan_link \
  | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 14 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +14 -delete

echo "Backup selesai: backup_$DATE.sql.gz"
```

```bash
# Tambahkan ke cron (setiap hari jam 02:00)
crontab -e
# 0 2 * * * /var/www/warisan-link/scripts/backup-db.sh
```

---

## 15. Environment Variables

### `backend/.env.example`

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL="mysql://warisan_user:StrongPassword!123@localhost:3306/warisan_link"

# JWT
JWT_SECRET=your_very_long_random_secret_here_min_32_chars
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=/var/www/warisan-link/uploads
MAX_FILE_SIZE_MB=5

# Email (Postfix atau SMTP server sendiri)
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=noreply@yourdomain.com

# App
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Admin seed
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=AdminPassword!123
```

### `frontend/.env.example`

```env
VITE_API_BASE_URL=https://yourdomain.com/api/v1
VITE_APP_NAME=WARISAN LINK
```

---

## 16. Security Checklist

| # | Item | Implementasi |
|---|------|-------------|
| 1 | Password hashing | bcryptjs, rounds: 12 |
| 2 | JWT secret kuat | Min 32 karakter random |
| 3 | Rate limiting | express-rate-limit di semua endpoint auth |
| 4 | Input validation | Zod schema di backend |
| 5 | SQL injection | Prisma ORM (parameterized queries) |
| 6 | XSS | React auto-escapes, Helmet.js di Express |
| 7 | CORS | Whitelist domain frontend saja |
| 8 | File upload | Validasi mime type + extension + size limit |
| 9 | HTTPS | Certbot / Let's Encrypt, auto-renew |
| 10 | Firewall | UFW: allow 22, 80, 443 only |
| 11 | MySQL | Tidak expose ke publik, localhost only |
| 12 | Env vars | Tidak di-commit ke Git (.gitignore) |
| 13 | Security headers | Nginx: X-Frame-Options, X-Content-Type-Options |
| 14 | Admin route | Role check middleware di setiap endpoint |

### UFW Firewall Setup

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

*WARISAN LINK — Connecting hidden heritage, local stories, and cross-border travelers.*  
*Spec Version: 1.0 | Stack: React + Express + MySQL + Nginx | Self-hosted VPS*
```
