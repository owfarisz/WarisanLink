# WarisanLink — Implementation PRD · Tugas 2 II2210 ITB

> **Deadline:** Rabu, 27 Mei 2026 · 23.59  
> **Platform:** Tourism & Culture Exchange  
> **Stack:** Node.js + Express + Prisma + PostgreSQL · React + Vite · Docker Compose  
> **Domain:** https://wisatalink.space

---

## Daftar Isi

1. [Ringkasan Gap & Prioritas](#1-ringkasan-gap--prioritas)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Database Schema — Migration 3](#3-database-schema--migration-3)
4. [Backend: Implementasi Auth & Admin](#4-backend-implementasi-auth--admin)
5. [Backend: Update Destinations Module](#5-backend-update-destinations-module)
6. [Frontend: Halaman Baru & Update](#6-frontend-halaman-baru--update)
7. [Docker Setup (Bonus)](#7-docker-setup-bonus)
8. [Environment Variables Guide](#8-environment-variables-guide)
9. [Dokumentasi Diagram](#9-dokumentasi-diagram)
10. [Deployment Guide](#10-deployment-guide)
11. [Verification Checklist](#11-verification-checklist)

---

## 1. Ringkasan Gap & Prioritas

| # | Requirement | Status | Poin | Aksi |
|---|------------|--------|------|------|
| 1 | Auth + 3 role (Superadmin, Kontributor, Turis) | ❌ Guest-only | 10 | Implementasi |
| 2 | Superadmin approve/reject registrasi | ❌ Belum ada | 10 | Implementasi |
| 3 | Produsen (Kontributor) upload konten | ❌ Belum ada | 15 | Implementasi |
| 4 | Konsumen (Turis) akses konten | ✅ Working | — | OK |
| 5 | Database mandiri PostgreSQL | ✅ Working | 15 | OK |
| 6 | Non-text storage (gambar) | ⚠️ Dir ada, multer belum | 15 | Tambah multer |
| 7 | Sequence diagrams (min 2) | ❌ Belum ada | 25 | Buat docs |
| 8 | System flowchart + tabel fungsi | ❌ Belum ada | 20 | Buat docs |
| 9 | Fitur unik + penjelasan | ⚠️ Ada, belum didokumentasikan | 10 | Buat docs |
| 10 | Docker (bonus +20) | ⚠️ DB only | +20 | Full compose |
| 11 | Platform online + screenshot | ✅ wisatalink.space | 10 | Ambil screenshot |

**Estimasi total jika semua selesai:** 100 + 20 bonus = 120 poin

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS Ubuntu 24.04 LTS                     │
│                                                             │
│  Cloudflare Tunnel ──► :8082                               │
│                          │                                  │
│  ┌───────────────────────▼────────────────────────────────┐ │
│  │         Docker Compose: warisan-network                │ │
│  │                                                        │ │
│  │  ┌─────────────────────────────────────┐              │ │
│  │  │    warisan-frontend (nginx:alpine)  │              │ │
│  │  │    Port: 80 (exposed: 8082)         │              │ │
│  │  │    Serves: React SPA (dist/)        │              │ │
│  │  │    Proxy: /api/* → backend:3000     │              │ │
│  │  └──────────────────┬──────────────────┘              │ │
│  │                     │ HTTP (internal)                  │ │
│  │  ┌──────────────────▼──────────────────┐              │ │
│  │  │    warisan-backend (node:20-alpine) │              │ │
│  │  │    Port: 3000 (NOT exposed)         │              │ │
│  │  │    Express + Prisma ORM             │              │ │
│  │  │    Volume: uploads/ (named)         │              │ │
│  │  └──────────────────┬──────────────────┘              │ │
│  │                     │ Prisma/TCP                       │ │
│  │  ┌──────────────────▼──────────────────┐              │ │
│  │  │    warisan-db (postgres:16-alpine)  │              │ │
│  │  │    Port: 5432 (exposed: 5434)       │              │ │
│  │  │    Volume: postgres_data (named)    │              │ │
│  │  └─────────────────────────────────────┘              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Role Pengguna

| Role | Deskripsi | Status Registrasi |
|------|-----------|-------------------|
| **Superadmin** | Platform administrator, approve/reject user & konten | Dibuat via seed script |
| **Kontributor** | Penyedia Jasa Travel / content creator destinasi warisan | PENDING → perlu approval Superadmin |
| **Turis** | Wisatawan yang browse & konsumsi konten | Langsung ACTIVE (self-register) |

---

## 3. Database Schema — Migration 3

> Migration ini **menambahkan** model User, JourneyItem, dan mengupdate Destination.  
> Data destinasi existing tetap aman karena `destStatus` default `PUBLISHED`.

### 3.1 Update `prisma/schema.prisma`

Tambahkan di bawah model yang sudah ada:

```prisma
// ──── Enums ─────────────────────────────────────────────────
enum Role {
  SUPERADMIN
  KONTRIBUTOR
  TURIS
}

enum UserStatus {
  PENDING
  ACTIVE
  REJECTED
  SUSPENDED
}

enum DestinationStatus {
  PENDING
  PUBLISHED
  REJECTED
}

// ──── Models Baru ────────────────────────────────────────────
model User {
  id           String      @id @default(uuid())
  email        String      @unique
  password     String
  name         String
  role         Role        @default(TURIS)
  status       UserStatus  @default(PENDING)
  organization String?
  bio          String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  destinations Destination[] @relation("KontributorDestinations")
  journeys     JourneyItem[]

  @@index([role])
  @@index([status])
}

model JourneyItem {
  id            String      @id @default(uuid())
  userId        String
  destinationId String
  savedAt       DateTime    @default(now())
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Cascade)

  @@unique([userId, destinationId])
  @@index([userId])
}
```

### 3.2 Update model `Destination` (tambah field baru)

```prisma
model Destination {
  id               String            @id @default(uuid())
  slug             String            @unique
  name             String
  city             String
  province         String
  categoryId       String
  shortDesc        String
  culturalMeaning  String            @db.Text
  localHistory     String            @db.Text
  malaysiaConnection String          @db.Text
  localEtiquette   String            @db.Text
  coverImageUrl    String?
  galleryUrls      Json?
  viewCount        Int               @default(0)
  // ── Fields baru ──────────────────────
  destStatus       DestinationStatus @default(PUBLISHED)  // PUBLISHED agar data lama tetap tampil
  creatorId        String?
  creator          User?             @relation("KontributorDestinations", fields: [creatorId], references: [id])
  // ── Fields lama ──────────────────────
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  category         Category          @relation(fields: [categoryId], references: [id])
  accessCompass    AccessCompass?
  journeys         JourneyItem[]

  @@index([categoryId])
  @@index([province])
  @@index([destStatus])
}
```

### 3.3 Jalankan Migration

```bash
cd warisan-link/backend

# Non-Docker (local dev)
npx prisma migrate dev --name add_auth_and_roles

# Docker (setelah container up)
docker compose exec backend npx prisma migrate deploy
```

### 3.4 Seed Superadmin

Buat file `warisan-link/backend/prisma/seed.js`:

```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'superadmin@warisanlink.id' }
  });

  if (existing) {
    console.log('Superadmin sudah ada, skip seeding.');
    return;
  }

  const hashed = await bcrypt.hash('Admin@Warisan123', 12);

  const superadmin = await prisma.user.create({
    data: {
      email: 'superadmin@warisanlink.id',
      password: hashed,
      name: 'Super Administrator',
      role: 'SUPERADMIN',
      status: 'ACTIVE',
    }
  });

  console.log('✅ Superadmin dibuat:', superadmin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Tambah ke `package.json`:
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

**Credentials superadmin:**
- Email: `superadmin@warisanlink.id`
- Password: `Admin@Warisan123`

---

## 4. Backend: Implementasi Auth & Admin

### 4.1 Install Packages

```bash
cd warisan-link/backend
npm install bcryptjs jsonwebtoken multer
```

### 4.2 Update `src/config/env.js` — Tambah JWT vars

```javascript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  UPLOAD_DIR: z.string().default('./uploads'),
  // ── Baru ──
  JWT_SECRET: z.string().min(16, 'JWT_SECRET minimal 16 karakter'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  // Optional
  UNSPLASH_ACCESS_KEY: z.string().optional(),
  PEXELS_API_KEY: z.string().optional(),
  PIXABAY_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

### 4.3 Buat `src/middlewares/auth.middleware.js`

```javascript
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Wajib login — lempar 401 jika tidak ada token
export const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token diperlukan' });
  }
  try {
    const payload = jwt.verify(auth.split(' ')[1], env.JWT_SECRET);
    req.user = payload; // { userId, role }
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token tidak valid atau kedaluwarsa' });
  }
};

// Role guard — gunakan setelah verifyToken
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success: false, error: 'Akses ditolak: role tidak sesuai' });
  }
  next();
};

// Opsional — tidak wajib login tapi jika ada token, decode
export const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(auth.split(' ')[1], env.JWT_SECRET);
    } catch { /* abaikan token invalid */ }
  }
  next();
};
```

### 4.4 Buat `src/config/multer.js`

```javascript
import multer from 'multer';
import path from 'path';
import { env } from './env.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `destination-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar JPG, PNG, atau WebP yang diizinkan'), false);
  }
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
```

### 4.5 Buat `src/modules/auth/auth.schema.js`

```javascript
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.enum(['TURIS', 'KONTRIBUTOR']),
  organization: z.string().optional(),
  bio: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

### 4.6 Buat `src/modules/auth/auth.service.js`

```javascript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';

const signToken = (user) =>
  jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

const safeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

export const register = async (data) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const err = new Error('Email sudah terdaftar');
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  const hashed = await bcrypt.hash(data.password, 12);
  // Turis langsung aktif, Kontributor harus approval dulu
  const status = data.role === 'TURIS' ? 'ACTIVE' : 'PENDING';

  const user = await prisma.user.create({
    data: { ...data, password: hashed, status },
  });

  if (status === 'ACTIVE') {
    return { user: safeUser(user), token: signToken(user) };
  }
  return {
    user: safeUser(user),
    token: null,
    message: 'Registrasi berhasil. Menunggu persetujuan Superadmin.',
  };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Email atau password salah');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  if (user.status === 'PENDING') {
    const err = new Error('Akun Anda menunggu persetujuan admin');
    err.code = 'ACCOUNT_PENDING';
    throw err;
  }
  if (user.status === 'REJECTED') {
    const err = new Error('Akun Anda ditolak. Hubungi admin.');
    err.code = 'ACCOUNT_REJECTED';
    throw err;
  }
  if (user.status === 'SUSPENDED') {
    const err = new Error('Akun Anda disuspend');
    err.code = 'ACCOUNT_SUSPENDED';
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Email atau password salah');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  return { user: safeUser(user), token: signToken(user) };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, status: true, organization: true, bio: true, createdAt: true },
  });
  if (!user) throw new Error('User tidak ditemukan');
  return user;
};
```

### 4.7 Buat `src/modules/auth/auth.controller.js`

```javascript
import * as authService from './auth.service.js';
import { validate } from '../../middlewares/validate.js';
import { RegisterSchema, LoginSchema } from './auth.schema.js';

export const register = [
  validate(RegisterSchema),
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      if (err.code === 'EMAIL_EXISTS') return res.status(409).json({ success: false, error: err.message });
      next(err);
    }
  },
];

export const login = [
  validate(LoginSchema),
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      const authCodes = ['INVALID_CREDENTIALS', 'ACCOUNT_PENDING', 'ACCOUNT_REJECTED', 'ACCOUNT_SUSPENDED'];
      if (authCodes.includes(err.code)) {
        return res.status(401).json({ success: false, error: err.message, code: err.code });
      }
      next(err);
    }
  },
];

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
```

### 4.8 Buat `src/modules/auth/auth.routes.js`

```javascript
import { Router } from 'express';
import * as authController from './auth.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', ...authController.register);
router.post('/login', ...authController.login);
router.get('/me', verifyToken, authController.getMe);

export default router;
```

### 4.9 Buat `src/modules/admin/admin.service.js`

```javascript
import { prisma } from '../../config/db.js';

export const getUsers = async ({ status, role, page = 1, limit = 20 }) => {
  const where = {};
  if (status) where.status = status;
  if (role) where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true, role: true, status: true, organization: true, createdAt: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const updateUserStatus = async (userId, status, adminId) => {
  if (adminId === userId) throw new Error('Tidak dapat mengubah status diri sendiri');
  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, email: true, name: true, role: true, status: true },
  });
};

export const getStats = async () => {
  const [totalUsers, pendingUsers, totalDestinations, publishedDestinations] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'PENDING' } }),
    prisma.destination.count(),
    prisma.destination.count({ where: { destStatus: 'PUBLISHED' } }),
  ]);

  return { totalUsers, pendingUsers, totalDestinations, publishedDestinations };
};

export const moderateDestination = async (destinationId, destStatus) => {
  return prisma.destination.update({
    where: { id: destinationId },
    data: { destStatus },
    select: { id: true, name: true, destStatus: true },
  });
};
```

### 4.10 Buat `src/modules/admin/admin.controller.js`

```javascript
import * as adminService from './admin.service.js';

export const getUsers = async (req, res, next) => {
  try {
    const { status, role, page, limit } = req.query;
    const result = await adminService.getUsers({ status, role, page: +page, limit: +limit });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['ACTIVE', 'REJECTED', 'SUSPENDED'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, error: 'Status tidak valid' });
    const user = await adminService.updateUserStatus(req.params.id, status, req.user.userId);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

export const moderateDestination = async (req, res, next) => {
  try {
    const { destStatus } = req.body;
    const allowed = ['PUBLISHED', 'REJECTED'];
    if (!allowed.includes(destStatus)) return res.status(400).json({ success: false, error: 'Status tidak valid' });
    const dest = await adminService.moderateDestination(req.params.id, destStatus);
    res.json({ success: true, data: dest });
  } catch (err) { next(err); }
};
```

### 4.11 Buat `src/modules/admin/admin.routes.js`

```javascript
import { Router } from 'express';
import * as adminController from './admin.controller.js';

const router = Router();

// Semua route admin sudah diproteksi di app.js dengan verifyToken + requireRole('SUPERADMIN')
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/stats', adminController.getStats);
router.put('/destinations/:id/moderate', adminController.moderateDestination);

export default router;
```

### 4.12 Update `src/app.js` — Daftarkan Routes Baru

```javascript
// Tambahkan import berikut di bagian atas
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import { verifyToken, requireRole } from './middlewares/auth.middleware.js';

// Tambahkan routes berikut (SEBELUM error middleware)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', verifyToken, requireRole('SUPERADMIN'), adminRoutes);
```

---

## 5. Backend: Update Destinations Module

### 5.1 Update `destination.routes.js` — Tambah Write Endpoints

```javascript
import { Router } from 'express';
import * as controller from './destination.controller.js';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware.js';
import { uploadImage } from '../../config/multer.js';

const router = Router();

// ── Public routes (sudah ada) ────────────────────────────────
router.get('/', controller.getDestinations);
router.get('/search', controller.searchDestinations);
router.get('/:slug', controller.getDestinationBySlug);

// ── Protected routes (baru) ──────────────────────────────────
router.post(
  '/',
  verifyToken,
  requireRole('KONTRIBUTOR', 'SUPERADMIN'),
  uploadImage.single('coverImage'),
  controller.createDestination
);

router.put(
  '/:id',
  verifyToken,
  requireRole('KONTRIBUTOR', 'SUPERADMIN'),
  uploadImage.single('coverImage'),
  controller.updateDestination
);

router.delete(
  '/:id',
  verifyToken,
  requireRole('KONTRIBUTOR', 'SUPERADMIN'),
  controller.deleteDestination
);

// Route untuk Kontributor melihat destinasi miliknya sendiri
router.get(
  '/my/destinations',
  verifyToken,
  requireRole('KONTRIBUTOR'),
  controller.getMyDestinations
);

export default router;
```

### 5.2 Tambah Handler di `destination.controller.js`

```javascript
// Tambah handler baru berikut:

export const createDestination = async (req, res, next) => {
  try {
    const { name, city, province, categoryId, shortDesc, culturalMeaning, localHistory, malaysiaConnection, localEtiquette } = req.body;
    const coverImageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const slug = slugify(`${name}-${city}`);

    const destination = await prisma.destination.create({
      data: {
        slug,
        name, city, province, categoryId,
        shortDesc, culturalMeaning, localHistory, malaysiaConnection, localEtiquette,
        coverImageUrl,
        creatorId: req.user.userId,
        destStatus: 'PENDING', // Harus diapprove Superadmin
      },
    });

    res.status(201).json({ success: true, data: destination });
  } catch (err) { next(err); }
};

export const getMyDestinations = async (req, res, next) => {
  try {
    const destinations = await prisma.destination.findMany({
      where: { creatorId: req.user.userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: destinations });
  } catch (err) { next(err); }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const dest = await prisma.destination.findUnique({ where: { id: req.params.id } });
    if (!dest) return res.status(404).json({ success: false, error: 'Destinasi tidak ditemukan' });
    // Kontributor hanya bisa hapus miliknya, Superadmin bisa hapus semua
    if (req.user.role === 'KONTRIBUTOR' && dest.creatorId !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Bukan destinasi Anda' });
    }
    await prisma.destination.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Destinasi dihapus' });
  } catch (err) { next(err); }
};
```

### 5.3 Update Query `getDestinations` — Filter PUBLISHED Only

Pada `destination.service.js`, ubah query utama:

```javascript
// Tambahkan filter destStatus di where clause
const where = {
  destStatus: 'PUBLISHED', // Hanya tampilkan yang sudah diapprove
  // ... filter lainnya tetap
};
```

---

## 6. Frontend: Halaman Baru & Update

### 6.1 Update `src/store/authStore.js`

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => set({ user, token }),

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
      },

      isLoggedIn: () => !!get().user,
      isSuperadmin: () => get().user?.role === 'SUPERADMIN',
      isKontributor: () => get().user?.role === 'KONTRIBUTOR',
      isTuris: () => get().user?.role === 'TURIS',
    }),
    {
      name: 'warisan-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

### 6.2 Buat `src/api/auth.api.js`

```javascript
import api from './axios.js';

export const register = (data) => api.post('/auth/register', data).then(r => r.data);
export const login = (data) => api.post('/auth/login', data).then(r => r.data);
export const getMe = () => api.get('/auth/me').then(r => r.data);
```

### 6.3 Update `src/api/axios.js` — Set token dari store

Tambahkan interceptor yang membaca token dari localStorage (sudah ada, pastikan key sesuai):

```javascript
// Pastikan request interceptor membaca key yang sesuai dengan authStore
instance.interceptors.request.use((config) => {
  const authData = JSON.parse(localStorage.getItem('warisan-auth') || '{}');
  const token = authData?.state?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 6.4 Buat `src/pages/LoginPage.jsx`

```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth, isSuperadmin, isKontributor } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      setAuth(data.user, data.token);
      toast.success(`Selamat datang, ${data.user.name}!`);
      // Redirect berdasarkan role
      if (data.user.role === 'SUPERADMIN') navigate('/admin');
      else if (data.user.role === 'KONTRIBUTOR') navigate('/kontributor');
      else navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login gagal';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Masuk ke WarisanLink</h1>
        <p className="text-stone-500 mb-6 text-sm">Temukan warisan budaya Indonesia–Malaysia</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium transition disabled:opacity-50"
          >
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Belum punya akun?{' '}
          <Link to="/register" className="text-amber-600 hover:underline font-medium">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
```

### 6.5 Buat `src/pages/RegisterPage.jsx`

```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'TURIS', organization: '', bio: ''
  });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await register(form);
      if (data.token) {
        setAuth(data.user, data.token);
        toast.success('Registrasi berhasil! Selamat datang.');
        navigate('/');
      } else {
        toast.success(data.message || 'Registrasi berhasil. Menunggu persetujuan admin.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">Buat Akun WarisanLink</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Jenis Akun</label>
            <select
              className="w-full border border-stone-300 rounded-lg px-3 py-2"
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            >
              <option value="TURIS">Turis / Wisatawan</option>
              <option value="KONTRIBUTOR">Kontributor / Penyedia Jasa Travel</option>
            </select>
            {form.role === 'KONTRIBUTOR' && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Akun Kontributor memerlukan persetujuan Superadmin
              </p>
            )}
          </div>

          <input placeholder="Nama Lengkap" required className="w-full border border-stone-300 rounded-lg px-3 py-2"
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <input type="email" placeholder="Email" required className="w-full border border-stone-300 rounded-lg px-3 py-2"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <input type="password" placeholder="Password (min. 8 karakter)" required minLength={8}
            className="w-full border border-stone-300 rounded-lg px-3 py-2"
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />

          {form.role === 'KONTRIBUTOR' && (
            <input placeholder="Nama Organisasi / Agen Travel" className="w-full border border-stone-300 rounded-lg px-3 py-2"
              value={form.organization} onChange={e => setForm(p => ({ ...p, organization: e.target.value }))} />
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium transition disabled:opacity-50">
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-4">
          Sudah punya akun? <Link to="/login" className="text-amber-600 hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
```

### 6.6 Buat `src/pages/AdminDashboard.jsx`

```jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api/axios';

const fetchPendingUsers = () => api.get('/admin/users?status=PENDING').then(r => r.data.data);
const fetchStats = () => api.get('/admin/stats').then(r => r.data.data);
const updateStatus = ({ id, status }) => api.put(`/admin/users/${id}/status`, { status }).then(r => r.data);

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: pending } = useQuery({ queryKey: ['pending-users'], queryFn: fetchPendingUsers });
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchStats });

  const mutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: (_, { status }) => {
      toast.success(status === 'ACTIVE' ? 'Pengguna disetujui' : 'Pengguna ditolak');
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Pengguna', value: stats.totalUsers },
            { label: 'Menunggu Approval', value: stats.pendingUsers, urgent: stats.pendingUsers > 0 },
            { label: 'Total Destinasi', value: stats.totalDestinations },
            { label: 'Destinasi Aktif', value: stats.publishedDestinations },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-xl ${s.urgent ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-stone-200'}`}>
              <p className="text-2xl font-bold text-stone-800">{s.value}</p>
              <p className="text-sm text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pending Users */}
      <h2 className="text-xl font-semibold text-stone-700 mb-4">Pendaftaran Menunggu Persetujuan</h2>
      {!pending?.users?.length ? (
        <p className="text-stone-400">Tidak ada pendaftaran yang menunggu.</p>
      ) : (
        <div className="space-y-3">
          {pending.users.map(user => (
            <div key={user.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-800">{user.name}</p>
                <p className="text-sm text-stone-500">{user.email} · {user.role}</p>
                {user.organization && <p className="text-xs text-stone-400">{user.organization}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => mutation.mutate({ id: user.id, status: 'ACTIVE' })}
                  className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                >
                  Setujui
                </button>
                <button
                  onClick={() => mutation.mutate({ id: user.id, status: 'REJECTED' })}
                  className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                >
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 6.7 Buat `src/pages/KontributorDashboard.jsx`

```jsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const fetchMyDestinations = () => api.get('/destinations/my/destinations').then(r => r.data.data);

const STATUS_BADGE = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

export default function KontributorDashboard() {
  const { data: destinations, isLoading } = useQuery({
    queryKey: ['my-destinations'],
    queryFn: fetchMyDestinations,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Dashboard Kontributor</h1>
        <Link to="/upload-destinasi"
          className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-medium">
          + Upload Destinasi
        </Link>
      </div>

      {isLoading ? (
        <p className="text-stone-400">Memuat...</p>
      ) : !destinations?.length ? (
        <div className="text-center py-16">
          <p className="text-stone-400 mb-4">Belum ada destinasi yang diunggah.</p>
          <Link to="/upload-destinasi" className="text-amber-600 hover:underline">Upload pertama Anda →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {destinations.map(d => (
            <div key={d.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {d.coverImageUrl && (
                  <img src={d.coverImageUrl} alt={d.name}
                    className="w-16 h-16 object-cover rounded-lg" />
                )}
                <div>
                  <p className="font-medium text-stone-800">{d.name}</p>
                  <p className="text-sm text-stone-500">{d.city}, {d.province}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[d.destStatus]}`}>
                {d.destStatus}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 6.8 Buat `src/pages/UploadDestinasi.jsx`

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api/axios';

const fetchCategories = () => api.get('/categories').then(r => r.data.data);

export default function UploadDestinasi() {
  const navigate = useNavigate();
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', city: '', province: '', categoryId: '',
    shortDesc: '', culturalMeaning: '', localHistory: '',
    malaysiaConnection: '', localEtiquette: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran gambar maksimal 5MB'); return; }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('coverImage', imageFile);
      await api.post('/destinations', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Destinasi berhasil diunggah! Menunggu persetujuan admin.');
      navigate('/kontributor');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload gagal');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Upload Destinasi Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nama Destinasi *</label>
            <input className="w-full border border-stone-300 rounded-lg px-3 py-2" required value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Kategori *</label>
            <select className="w-full border border-stone-300 rounded-lg px-3 py-2" required value={form.categoryId} onChange={set('categoryId')}>
              <option value="">Pilih kategori</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Kota *</label>
            <input className="w-full border border-stone-300 rounded-lg px-3 py-2" required value={form.city} onChange={set('city')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Provinsi *</label>
            <input className="w-full border border-stone-300 rounded-lg px-3 py-2" required value={form.province} onChange={set('province')} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Deskripsi Singkat *</label>
          <textarea rows={2} className="w-full border border-stone-300 rounded-lg px-3 py-2" required value={form.shortDesc} onChange={set('shortDesc')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Makna Budaya *</label>
          <textarea rows={3} className="w-full border border-stone-300 rounded-lg px-3 py-2" required value={form.culturalMeaning} onChange={set('culturalMeaning')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Sejarah Lokal *</label>
          <textarea rows={3} className="w-full border border-stone-300 rounded-lg px-3 py-2" required value={form.localHistory} onChange={set('localHistory')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Koneksi dengan Malaysia</label>
          <textarea rows={2} className="w-full border border-stone-300 rounded-lg px-3 py-2" value={form.malaysiaConnection} onChange={set('malaysiaConnection')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Etiket Lokal</label>
          <textarea rows={2} className="w-full border border-stone-300 rounded-lg px-3 py-2" value={form.localEtiquette} onChange={set('localEtiquette')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Foto Cover (JPG/PNG/WebP, maks 5MB)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="w-full text-sm text-stone-500" />
          {preview && <img src={preview} alt="preview" className="mt-2 h-32 object-cover rounded-lg" />}
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-amber-600 text-white py-2.5 rounded-xl hover:bg-amber-700 font-medium transition disabled:opacity-50">
          {loading ? 'Mengunggah...' : 'Upload Destinasi'}
        </button>
      </form>
    </div>
  );
}
```

### 6.9 Update `src/App.jsx` — Tambah Routes

```jsx
// Tambahkan imports
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import KontributorDashboard from './pages/KontributorDashboard';
import UploadDestinasi from './pages/UploadDestinasi';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Tambahkan routes berikut dalam <Routes>:
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/admin" element={
  <ProtectedRoute requiredRole="SUPERADMIN">
    <AdminDashboard />
  </ProtectedRoute>
} />
<Route path="/kontributor" element={
  <ProtectedRoute requiredRole="KONTRIBUTOR">
    <KontributorDashboard />
  </ProtectedRoute>
} />
<Route path="/upload-destinasi" element={
  <ProtectedRoute requiredRole="KONTRIBUTOR">
    <UploadDestinasi />
  </ProtectedRoute>
} />
```

### 6.10 Update `src/components/shared/ProtectedRoute.jsx`

```jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;

  return children;
}
```

### 6.11 Update `src/components/layout/Navbar.jsx` — Tambah Auth Links

```jsx
// Tambahkan di bagian navigasi:
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

// Di dalam komponen Navbar:
const { user, logout } = useAuthStore();
const navigate = useNavigate();

const handleLogout = () => {
  logout();
  navigate('/');
};

// Render kondisional:
{!user ? (
  <div className="flex gap-2">
    <Link to="/login" className="px-3 py-1.5 text-stone-600 hover:text-amber-600 text-sm">Masuk</Link>
    <Link to="/register" className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700">Daftar</Link>
  </div>
) : (
  <div className="flex items-center gap-3">
    <span className="text-sm text-stone-600">{user.name}</span>
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
      user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700' :
      user.role === 'KONTRIBUTOR' ? 'bg-blue-100 text-blue-700' :
      'bg-green-100 text-green-700'
    }`}>{user.role}</span>
    {user.role === 'SUPERADMIN' && <Link to="/admin" className="text-sm text-purple-600 hover:underline">Dashboard</Link>}
    {user.role === 'KONTRIBUTOR' && <Link to="/kontributor" className="text-sm text-blue-600 hover:underline">Dashboard</Link>}
    <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Keluar</button>
  </div>
)}
```

---

## 7. Docker Setup (Bonus)

### 7.1 `warisan-link/backend/Dockerfile`

```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy node_modules dan source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

# Jalankan migration sebelum start server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

### 7.2 `warisan-link/frontend/Dockerfile`

```dockerfile
# Stage 1: Build React app
FROM node:20-alpine AS builder
WORKDIR /app

# Build args untuk Vite env vars (di-inject saat docker compose build)
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_APP_NAME="WARISAN LINK"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve dengan nginx
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 7.3 `warisan-link/frontend/nginx.conf`

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Proxy API requests ke backend container
    location /api/ {
        proxy_pass http://backend:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }

    # Proxy uploads ke backend
    location /uploads/ {
        proxy_pass http://backend:3000/uploads/;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=2592000";
    }

    # React SPA — semua route ke index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 7.4 `warisan-link/docker-compose.yml` (REPLACE existing)

```yaml
name: warisan-link

services:
  db:
    image: postgres:16-alpine
    container_name: warisan-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-warisan_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-StrongPassword!123}
      POSTGRES_DB: ${DB_NAME:-warisan_link}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "${DB_PORT:-5434}:5432"
    networks:
      - warisan-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-warisan_user} -d ${DB_NAME:-warisan_link}"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: warisan-backend
    restart: unless-stopped
    env_file: ./backend/.env
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads:/app/uploads
      - ./backend/logs:/app/logs
    networks:
      - warisan-network
    # Backend TIDAK di-expose ke host — hanya diakses via nginx
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/api/v1/categories || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: /api/v1
        VITE_APP_NAME: "WARISAN LINK"
    container_name: warisan-frontend
    restart: unless-stopped
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - "${FRONTEND_PORT:-8082}:80"
    networks:
      - warisan-network

networks:
  warisan-network:
    driver: bridge
    name: warisan-network

volumes:
  postgres_data:
    name: warisan-postgres-data
  uploads:
    name: warisan-uploads
```

### 7.5 `.env.example` (root `warisan-link/`)

```env
# ── Docker Port Mapping ───────────────────────────────────
# VPS: gunakan 8082 (Cloudflare Tunnel target)
# Local: ubah ke 8080
FRONTEND_PORT=8082

# Postgres host port (5432 dan 5433 sudah dipakai proyek lain di VPS)
DB_PORT=5434

# ── PostgreSQL Credentials ────────────────────────────────
DB_USER=warisan_user
DB_PASSWORD=StrongPassword!123
DB_NAME=warisan_link
```

---

## 8. Environment Variables Guide

### Backend `.env` (untuk Docker — `warisan-link/backend/.env`)

```env
# ── App ───────────────────────────────────────────────────
NODE_ENV=production
PORT=3000

# ── Database ──────────────────────────────────────────────
# PENTING: di Docker gunakan 'db' sebagai hostname (nama service di compose)
# Bukan localhost atau 127.0.0.1!
DATABASE_URL="postgresql://warisan_user:StrongPassword!123@db:5432/warisan_link"

# ── File Upload ───────────────────────────────────────────
UPLOAD_DIR=./uploads

# ── JWT ───────────────────────────────────────────────────
# Ganti dengan string random minimal 32 karakter!
# Generator: openssl rand -base64 32
JWT_SECRET=ganti-dengan-secret-acak-minimal-32-karakter
JWT_EXPIRES_IN=7d

# ── Optional API Keys ─────────────────────────────────────
UNSPLASH_ACCESS_KEY=
PEXELS_API_KEY=
PIXABAY_API_KEY=
```

### Backend `.env` (untuk Local Dev tanpa Docker)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://warisan_user:StrongPassword!123@localhost:5432/warisan_link"
UPLOAD_DIR=./uploads
JWT_SECRET=dev-secret-untuk-local-saja-minimal-32c
JWT_EXPIRES_IN=7d
```

### Frontend `.env` (build-time via Docker args — tidak perlu diubah)

```env
# Ini di-set via docker-compose build args — JANGAN diubah untuk Docker
VITE_API_BASE_URL=/api/v1
VITE_APP_NAME=WARISAN LINK
```

### Frontend `.env` (untuk Local Dev `npm run dev`)

```env
# Untuk development lokal (tanpa Docker)
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=WARISAN LINK
```

### Tabel Lengkap Environment Variables

| Variable | Scope | Wajib | Keterangan |
|----------|-------|-------|------------|
| `NODE_ENV` | backend | ✅ | `production` atau `development` |
| `PORT` | backend | ✅ | Port Express, default 3000 |
| `DATABASE_URL` | backend | ✅ | Format: `postgresql://user:pass@host:port/db` |
| `UPLOAD_DIR` | backend | ✅ | Path folder upload, default `./uploads` |
| `JWT_SECRET` | backend | ✅ | String random >= 32 char. **Jangan share!** |
| `JWT_EXPIRES_IN` | backend | ❌ | Default `7d`. Format: `Xd`, `Xh`, `Xm` |
| `FRONTEND_PORT` | compose | ❌ | Host port mapping, default `8082` |
| `DB_PORT` | compose | ❌ | Host port mapping DB, default `5434` |
| `DB_USER` | compose | ❌ | PostgreSQL user |
| `DB_PASSWORD` | compose | ❌ | PostgreSQL password |
| `DB_NAME` | compose | ❌ | PostgreSQL database name |
| `VITE_API_BASE_URL` | frontend | ✅ | `/api/v1` untuk Docker, `http://localhost:3000/api/v1` untuk dev |
| `VITE_APP_NAME` | frontend | ❌ | Nama aplikasi di tab browser |

---

## 9. Dokumentasi Diagram

### 9.1 Sequence Diagram 1 — Kontributor Upload Destinasi

**File:** `docs/sequence/01-kontributor-upload-destinasi.md`

```mermaid
sequenceDiagram
    actor KT as Kontributor
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant FS as File Storage (uploads/)
    participant DB as Database (PostgreSQL)

    Note over KT,DB: FLOW A — Upload Berhasil (Valid)

    KT->>FE: Buka /upload-destinasi
    FE->>FE: Cek token JWT di authStore
    FE->>BE: GET /api/v1/categories
    BE->>DB: SELECT * FROM categories
    DB-->>BE: Daftar kategori
    BE-->>FE: 200 { data: categories[] }
    FE-->>KT: Tampilkan form dengan pilihan kategori

    KT->>FE: Isi form + pilih gambar cover (JPG, 2MB)
    KT->>FE: Klik "Upload Destinasi"

    FE->>BE: POST /api/v1/destinations\n  (multipart/form-data)\n  Authorization: Bearer <token>
    
    BE->>BE: Verifikasi JWT token
    BE->>BE: Cek role === KONTRIBUTOR
    BE->>BE: Multer: validasi file\n  (type: JPG ✅, size: 2MB < 5MB ✅)
    BE->>FS: Simpan file ke uploads/destination-{timestamp}.jpg
    FS-->>BE: Path file tersimpan
    
    BE->>BE: Buat slug dari nama + kota
    BE->>DB: INSERT INTO destinations\n  (name, slug, coverImageUrl, creatorId,\n  destStatus='PENDING', ...)
    DB-->>BE: Destination created
    
    BE-->>FE: 201 { success: true, data: destination }
    FE-->>KT: Toast "Destinasi berhasil diunggah! Menunggu persetujuan admin."
    FE->>FE: Redirect ke /kontributor

    Note over KT,DB: FLOW B — Upload Gagal (File Tidak Valid)

    KT->>FE: Pilih file PDF (5.5MB)
    KT->>FE: Klik "Upload Destinasi"

    FE->>FE: Cek ukuran file di client
    FE-->>KT: Toast error "Ukuran gambar maksimal 5MB"

    Note right of FE: Client-side validation\ncegah request ke server

    KT->>FE: Pilih file PDF (2MB)
    KT->>FE: Klik "Upload Destinasi"
    FE->>BE: POST /api/v1/destinations (multipart)\n  file: dokumen.pdf
    BE->>BE: Multer fileFilter:\n  mimetype = application/pdf ❌
    BE-->>FE: 400 { error: "Hanya file gambar JPG, PNG, WebP" }
    FE-->>KT: Toast error "Hanya file gambar JPG, PNG, atau WebP yang diizinkan"
```

---

### 9.2 Sequence Diagram 2 — Turis Akses Destinasi

**File:** `docs/sequence/02-turis-akses-destinasi.md`

```mermaid
sequenceDiagram
    actor TR as Turis
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant DB as Database (PostgreSQL)
    participant WA as Weather API (Open-Meteo)

    Note over TR,WA: FLOW A — Browse & Lihat Detail Berhasil

    TR->>FE: Buka https://wisatalink.space
    FE->>BE: GET /api/v1/destinations?page=1&limit=12
    BE->>DB: SELECT * FROM destinations\n  WHERE destStatus = 'PUBLISHED'\n  ORDER BY createdAt DESC\n  LIMIT 12
    DB-->>BE: destinations[], total
    BE-->>FE: 200 { data: { destinations[], total, page } }
    FE-->>TR: Tampilkan heritage cards (grid)

    TR->>FE: Filter berdasarkan Kategori "Candi"
    FE->>BE: GET /api/v1/destinations?category=candi
    BE->>DB: SELECT * FROM destinations\n  JOIN categories ON ...\n  WHERE category.slug = 'candi'\n  AND destStatus = 'PUBLISHED'
    DB-->>BE: Filtered destinations
    BE-->>FE: 200 { data: ... }
    FE-->>TR: Update grid dengan hasil filter

    TR->>FE: Klik kartu "Candi Borobudur"
    FE->>BE: GET /api/v1/destinations/candi-borobudur-magelang
    BE->>DB: SELECT * FROM destinations WHERE slug = '...'\n  INCLUDE accessCompass
    DB-->>BE: Destination detail + compass
    BE->>DB: UPDATE destinations\n  SET viewCount = viewCount + 1
    DB-->>BE: Updated
    BE->>WA: GET /forecast?latitude=-7.6079&longitude=110.2038\n  &current=temperature_2m,wind_speed_10m
    WA-->>BE: { current: { temperature_2m: 28, ... } }
    BE-->>FE: 200 { data: { destination, compass, weather } }
    FE-->>TR: Tampilkan halaman detail:\n  - Deskripsi budaya\n  - Access Compass\n  - Cuaca real-time\n  - Peta Leaflet

    Note over TR,WA: FLOW B — Pencarian Tidak Menemukan Hasil

    TR->>FE: Ketik "kastil gotik" di search bar
    FE->>BE: GET /api/v1/destinations/search?q=kastil+gotik
    BE->>DB: SELECT * FROM destinations\n  WHERE (name ILIKE '%kastil gotik%'\n    OR shortDesc ILIKE '%kastil gotik%')\n  AND destStatus = 'PUBLISHED'
    DB-->>BE: [] (empty array)
    BE-->>FE: 200 { data: { destinations: [], total: 0 } }
    FE-->>TR: Tampilkan EmptyState:\n  "Tidak ada destinasi ditemukan untuk 'kastil gotik'"
```

---

### 9.3 Sequence Diagram 3 — Superadmin Approve/Reject Kontributor

**File:** `docs/sequence/03-superadmin-approve-kontributor.md`

```mermaid
sequenceDiagram
    actor KT as Kontributor
    actor SA as Superadmin
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant DB as Database (PostgreSQL)

    Note over KT,DB: ALUR REGISTRASI KONTRIBUTOR

    KT->>FE: Buka /register, pilih "Kontributor"
    KT->>FE: Isi: nama, email, password, organisasi
    FE->>BE: POST /api/v1/auth/register\n  { name, email, password,\n  role: "KONTRIBUTOR", organization }
    BE->>DB: SELECT user WHERE email = ?
    DB-->>BE: null (email belum ada)
    BE->>BE: bcrypt.hash(password, 12)
    BE->>DB: INSERT INTO users\n  (status = 'PENDING', role = 'KONTRIBUTOR')
    DB-->>BE: User { status: PENDING }
    BE-->>FE: 201 { data: { user, token: null,\n  message: "Menunggu persetujuan admin" } }
    FE-->>KT: Notifikasi: "Registrasi berhasil. Menunggu persetujuan."

    Note over KT,DB: FLOW A — Superadmin MENYETUJUI

    SA->>FE: Login sebagai Superadmin, buka /admin
    FE->>BE: GET /api/v1/admin/users?status=PENDING\n  Authorization: Bearer <superadmin-token>
    BE->>BE: Verifikasi JWT, cek role === SUPERADMIN
    BE->>DB: SELECT users WHERE status = 'PENDING'
    DB-->>BE: [{ id, name, email, organization, ... }]
    BE-->>FE: 200 { data: { users: [Kontributor...] } }
    FE-->>SA: Tampilkan daftar pending users

    SA->>FE: Klik "Setujui" untuk Kontributor X
    FE->>BE: PUT /api/v1/admin/users/{id}/status\n  { status: "ACTIVE" }
    BE->>DB: UPDATE users SET status = 'ACTIVE'\n  WHERE id = ?
    DB-->>BE: User { status: ACTIVE }
    BE-->>FE: 200 { success: true, data: user }
    FE-->>SA: Toast "Pengguna disetujui"

    Note right of KT: Kontributor kini dapat login\ndan upload destinasi

    Note over KT,DB: FLOW B — Superadmin MENOLAK

    SA->>FE: Klik "Tolak" untuk Kontributor Y
    FE->>BE: PUT /api/v1/admin/users/{id}/status\n  { status: "REJECTED" }
    BE->>DB: UPDATE users SET status = 'REJECTED'\n  WHERE id = ?
    DB-->>BE: User { status: REJECTED }
    BE-->>FE: 200 { success: true }
    FE-->>SA: Toast "Pengguna ditolak"

    Note right of KT: Jika Kontributor Y coba login:\n401 "Akun Anda ditolak. Hubungi admin."
```

---

### 9.4 System Flowchart

**File:** `docs/flowchart/system-flowchart.md`

```mermaid
flowchart TD
    START([🌐 User Mengakses wisatalink.space]) --> AUTH{Sudah Login?}

    AUTH -->|Tidak| GUEST_BROWSE[Browse Destinasi sebagai Guest]
    AUTH -->|Ya| ROLE_CHECK{Role User?}

    GUEST_BROWSE --> GUEST_FILTER[Filter/Cari Destinasi]
    GUEST_FILTER --> GUEST_DETAIL[Lihat Detail Destinasi]
    GUEST_DETAIL --> GUEST_WEATHER[Lihat Cuaca & Access Compass]
    GUEST_WEATHER --> WANT_SAVE{Ingin Simpan Journey?}
    WANT_SAVE -->|Ya| NEED_LOGIN[Arahkan ke Login/Register]
    WANT_SAVE -->|Tidak| DONE([Selesai])

    NEED_LOGIN --> REG_OR_LOGIN{Sudah punya akun?}
    REG_OR_LOGIN -->|Tidak| REGISTER

    subgraph REGISTER ["📝 Alur Registrasi"]
        REG_FORM[Isi Form Registrasi] --> ROLE_SELECT{Pilih Role}
        ROLE_SELECT -->|Turis| REG_TURIS[Simpan ke DB\nstatus = ACTIVE]
        ROLE_SELECT -->|Kontributor| REG_KT[Simpan ke DB\nstatus = PENDING]
        REG_TURIS --> AUTO_LOGIN[Login Otomatis ✅]
        REG_KT --> WAIT_APPROVAL[Tunggu Approval\nSuperadmin ⏳]
    end

    REG_OR_LOGIN -->|Ya| LOGIN

    subgraph LOGIN ["🔑 Alur Login"]
        LOGIN_FORM[Isi Email & Password] --> VALID_CREDS{Kredensial Valid?}
        VALID_CREDS -->|Tidak| LOGIN_ERR[❌ Error: Email/Password salah]
        VALID_CREDS -->|Ya| STATUS_CHECK{Status Akun?}
        STATUS_CHECK -->|PENDING| PENDING_ERR[❌ Error: Menunggu persetujuan]
        STATUS_CHECK -->|REJECTED| REJECT_ERR[❌ Error: Akun ditolak]
        STATUS_CHECK -->|ACTIVE| JWT_GEN[✅ Generate JWT Token]
        JWT_GEN --> ROLE_REDIRECT{Redirect by Role}
    end

    ROLE_CHECK -->|SUPERADMIN| ADMIN_DASHBOARD
    ROLE_REDIRECT -->|SUPERADMIN| ADMIN_DASHBOARD
    ROLE_CHECK -->|KONTRIBUTOR| KT_DASHBOARD
    ROLE_REDIRECT -->|KONTRIBUTOR| KT_DASHBOARD
    ROLE_CHECK -->|TURIS| TURIS_FLOW
    ROLE_REDIRECT -->|TURIS| TURIS_FLOW

    subgraph ADMIN_DASHBOARD ["👑 Superadmin Flow"]
        AD_HOME[Dashboard Admin] --> AD_STATS[Lihat Statistik Platform]
        AD_HOME --> AD_USERS[Kelola Pengguna]
        AD_USERS --> AD_APPROVE{Approve/Reject\nPendaftaran?}
        AD_APPROVE -->|Approve| AD_ACTIVE[Update status = ACTIVE]
        AD_APPROVE -->|Reject| AD_REJECT[Update status = REJECTED]
        AD_HOME --> AD_CONTENT[Moderasi Konten Destinasi]
        AD_CONTENT --> AD_DEST_STATUS{Approve/Reject\nDestinasi?}
        AD_DEST_STATUS -->|Approve| AD_PUBLISH[destStatus = PUBLISHED]
        AD_DEST_STATUS -->|Reject| AD_DEST_REJ[destStatus = REJECTED]
    end

    subgraph KT_DASHBOARD ["🏛️ Kontributor Flow"]
        KT_HOME[Dashboard Kontributor] --> KT_LIST[Lihat Destinasi Saya]
        KT_HOME --> KT_UPLOAD[Upload Destinasi Baru]
        KT_UPLOAD --> KT_FORM[Isi Form Destinasi]
        KT_FORM --> KT_IMG[Upload Gambar Cover]
        KT_IMG --> KT_VALID{Validasi File}
        KT_VALID -->|❌ Bukan gambar / >5MB| KT_ERR[Error: File tidak valid]
        KT_VALID -->|✅ Valid| KT_SAVE[Simpan ke DB\ndestStatus = PENDING]
        KT_SAVE --> KT_NOTIFY[Notifikasi ke Superadmin]
    end

    subgraph TURIS_FLOW ["🧳 Turis Flow"]
        TR_HOME[Browse Beranda] --> TR_FILTER[Filter Kategori/Provinsi]
        TR_FILTER --> TR_SEARCH[Cari Destinasi]
        TR_SEARCH --> TR_RESULT{Hasil Ditemukan?}
        TR_RESULT -->|❌ Tidak| TR_EMPTY[Tampilkan Empty State]
        TR_RESULT -->|✅ Ya| TR_LIST[Tampilkan Heritage Cards]
        TR_LIST --> TR_DETAIL[Buka Detail Destinasi]
        TR_DETAIL --> TR_INFO[Lihat Info Budaya, Sejarah,\nKoneksi Malaysia]
        TR_DETAIL --> TR_COMPASS[Lihat Access Compass & Peta]
        TR_DETAIL --> TR_WEATHER[Cuaca Real-time Open-Meteo]
        TR_DETAIL --> TR_SAVE[Simpan ke Journey]
        TR_SAVE --> TR_SAVED[✅ JourneyItem tersimpan]
    end
```

---

### 9.5 Docker Architecture Diagram

**File:** `docs/architecture/docker-architecture.md`

```mermaid
graph TB
    subgraph INTERNET ["🌐 Internet"]
        USER["👤 User Browser\nHTTPS"]
        CF["☁️ Cloudflare Tunnel\nwisatalink.space"]
    end

    USER -->|"HTTPS"| CF

    subgraph VPS ["🖥️ VPS Ubuntu 24.04 LTS"]
        CF -->|"HTTP → localhost:8082"| FE_PORT

        subgraph COMPOSE ["🐳 Docker Compose — warisan-network (bridge)"]

            subgraph FE_CONTAINER ["warisan-frontend"]
                FE_PORT["Host Port :8082"] --> FE_SVC["nginx:1.27-alpine\nPort :80"]
                FE_SVC -->|"Serves"| REACT_BUILD[/"React SPA\n(dist/)"/]
            end

            subgraph BE_CONTAINER ["warisan-backend"]
                BE_SVC["node:20-alpine\nPort :3000\n(NOT exposed to host)"]
                BE_UPLOADS[/"uploads/\n(Named Volume)"/]
                BE_SVC --- BE_UPLOADS
            end

            subgraph DB_CONTAINER ["warisan-db"]
                DB_PORT["Host Port :5434"] --> DB_SVC["postgres:16-alpine\nPort :5432"]
                DB_DATA[/"postgres_data\n(Named Volume)"/]
                DB_SVC --- DB_DATA
            end

            FE_SVC -->|"Proxy /api/*\nHTTP internal"| BE_SVC
            FE_SVC -->|"Proxy /uploads/*"| BE_SVC
            BE_SVC -->|"Prisma ORM\nTCP"| DB_SVC
        end

        BE_SVC -->|"Healthcheck\n(WAIT 30s)"| DB_SVC
        FE_SVC -->|"Healthcheck\n(WAIT backend healthy)"| BE_SVC
    end

    subgraph EXTERNAL ["🔗 External APIs"]
        OPENMETEO["Open-Meteo API\nCuaca Real-time\n(Free, No Key)"]
    end

    BE_SVC -->|"HTTP Request"| OPENMETEO
```

---

### 9.6 Tabel Fungsi Platform

**File:** `docs/tabel-fungsi.md`

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

---

## 10. Deployment Guide

### 10.1 Trial Lokal (Sebelum Push ke VPS)

```bash
# 1. Masuk ke direktori warisan-link
cd warisan-link

# 2. Buat file environment
cp .env.example .env
#  Edit .env: ubah FRONTEND_PORT=8080 untuk local agar tidak konflik dengan port lain

cp backend/.env.example backend/.env
#  Edit backend/.env:
#  - JWT_SECRET: generate dengan: openssl rand -base64 32
#  - Pastikan DATABASE_URL pakai 'db' sebagai host (BUKAN localhost)
#    DATABASE_URL="postgresql://warisan_user:StrongPassword!123@db:5432/warisan_link"

# 3. Build dan jalankan semua container
docker compose up -d --build
#  Proses ini akan:
#  - Build backend image (node:20-alpine)
#  - Build frontend image (multi-stage: build React → nginx)
#  - Start db, tunggu healthcheck
#  - Start backend (jalankan prisma migrate deploy otomatis)
#  - Start frontend setelah backend healthy

# 4. Cek status container
docker compose ps
#  Semua harus "healthy" atau "running":
#  warisan-db       ... healthy
#  warisan-backend  ... healthy
#  warisan-frontend ... running

# 5. Seed superadmin (hanya pertama kali!)
docker compose exec backend node prisma/seed.js
#  Output: "✅ Superadmin dibuat: superadmin@warisanlink.id"

# 6. Test API
curl http://localhost:8080/api/v1/destinations
curl http://localhost:8080/api/v1/categories

# 7. Buka browser
# http://localhost:8080

# 8. Test login superadmin
#  Email: superadmin@warisanlink.id
#  Password: Admin@Warisan123
#  → Redirect ke /admin

# 9. Lihat logs jika ada error
docker compose logs backend --tail=50
docker compose logs frontend --tail=20
```

### 10.2 VPS Deployment (Setelah Local OK)

```bash
# Di laptop/komputer: push perubahan ke GitHub
git add .
git commit -m "feat: add auth, RBAC, full docker setup"
git push origin main

# ─────────────────────────────────────────────────
# Di VPS (SSH ke server):
# ─────────────────────────────────────────────────

# 1. Masuk ke direktori project
cd ~/WarisanLink/warisan-link

# 2. Pull kode terbaru
git pull origin main

# 3. Setup env (HANYA PERTAMA KALI — skip jika sudah ada)
cp .env.example .env
#  Cek: FRONTEND_PORT=8082 (default, untuk Cloudflare Tunnel)
#       DB_PORT=5434 (agar tidak konflik dengan port 5433 pawangcuaca)

cp backend/.env.example backend/.env
#  WAJIB ubah: JWT_SECRET=<string-acak-32-char>
#  Pastikan DATABASE_URL pakai 'db': @db:5432/warisan_link

# 4. Stop container lama jika ada
docker compose down

# 5. Build dan jalankan
docker compose up -d --build
#  Build akan memakan waktu 2-5 menit (node_modules + npm run build)

# 6. Seed superadmin (HANYA PERTAMA KALI)
docker compose exec backend node prisma/seed.js

# 7. Verifikasi
docker compose ps
curl http://localhost:8082/api/v1/destinations
curl https://wisatalink.space/api/v1/destinations

# 8. Cek logs
docker compose logs -f --tail=100
```

### 10.3 Cloudflare Tunnel Setup (VPS)

Pastikan tunnel Cloudflare diarahkan ke:
- **URL:** `http://localhost:8082`
- **Domain:** `wisatalink.space`

Cek konfigurasi tunnel:
```bash
cloudflared tunnel list
cloudflared tunnel info <tunnel-name>
```

### 10.4 Update Setelah Perubahan Kode

```bash
# Di VPS, jika ada perubahan kode baru:
cd ~/WarisanLink/warisan-link
git pull origin main
docker compose up -d --build

# Jika hanya perubahan backend (lebih cepat):
docker compose up -d --build backend

# Jika hanya perubahan frontend:
docker compose up -d --build frontend
```

### 10.5 Backup Database

```bash
# Manual backup
docker compose exec db pg_dump -U warisan_user warisan_link > backup-$(date +%Y%m%d).sql

# Restore
docker compose exec -T db psql -U warisan_user warisan_link < backup-20260527.sql
```

---

## 11. Verification Checklist

### Auth & Role Check

- [ ] Register Turis → langsung aktif, dapat login, redirect ke `/`
- [ ] Register Kontributor → status PENDING, tidak dapat login (dapat pesan "menunggu approval")
- [ ] Login Superadmin (`superadmin@warisanlink.id` / `Admin@Warisan123`) → redirect ke `/admin`
- [ ] Superadmin approve Kontributor → Kontributor dapat login, redirect ke `/kontributor`
- [ ] Superadmin reject Kontributor → login gagal dengan pesan "Akun Anda ditolak"
- [ ] Akses `/admin` tanpa login → redirect ke `/login`
- [ ] Akses `/admin` sebagai Turis → redirect ke `/`

### Content Flow Check

- [ ] Kontributor upload destinasi dengan gambar JPG 2MB → berhasil, status PENDING
- [ ] Kontributor upload gambar >5MB → error client-side, tidak kirim ke server
- [ ] Kontributor upload file PDF → error 400 dari server
- [ ] Superadmin approve destinasi → destinasi tampil di beranda
- [ ] Turis browse → hanya lihat destinasi PUBLISHED
- [ ] Turis search → hasil muncul atau empty state

### Docker Check

```bash
docker compose ps
# Semua 3 service running/healthy

docker network inspect warisan-link_warisan-network
# Tampilkan 3 container terhubung

docker volume ls | grep warisan
# warisan-postgres-data
# warisan-uploads

curl http://localhost:8082/api/v1/destinations
# Response JSON valid

curl http://localhost:8082/api/v1/categories
# Response JSON valid
```

### VPS Check

```bash
curl https://wisatalink.space/api/v1/destinations
# Response JSON dari database

# Test upload via curl (sebagai Kontributor yang sudah diapprove)
# 1. Login dulu untuk dapat token
TOKEN=$(curl -s -X POST https://wisatalink.space/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kontributor@test.com","password":"test1234"}' \
  | jq -r '.data.token')

# 2. Upload destinasi
curl -X POST https://wisatalink.space/api/v1/destinations \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Test Destinasi" \
  -F "city=Bandung" \
  -F "province=Jawa Barat" \
  -F "categoryId=<id-dari-categories>" \
  -F "shortDesc=Test deskripsi singkat" \
  -F "culturalMeaning=Makna budaya test" \
  -F "localHistory=Sejarah lokal test" \
  -F "malaysiaConnection=Koneksi malaysia test" \
  -F "localEtiquette=Etiket lokal test"
```

---

## Referensi Arsitektur

1. A. A. Arman dan D. W. Anggara, "VPS Server Setup", ITB, Bandung, Slide Materi Perkuliahan, 2026.
2. A. A. Arman, "Cloud Computing Technologies", ITB, Bandung, Slide Materi Perkuliahan, 2026.
3. Prisma, "Prisma ORM Documentation", https://www.prisma.io/docs, 2025. [Alasan: Type-safe database client dengan migration system yang handal untuk PostgreSQL self-hosted]
4. Docker, "Docker Compose Documentation", https://docs.docker.com/compose, 2025. [Alasan: Orchestration multi-container yang memastikan environment konsisten antara dev dan production]
5. nginx, "nginx reverse proxy documentation", https://nginx.org/en/docs, 2025. [Alasan: High-performance web server sekaligus reverse proxy untuk routing API dan serving static files]
6. JSON Web Tokens (JWT), "Introduction to JSON Web Tokens", https://jwt.io/introduction, 2025. [Alasan: Stateless authentication yang cocok untuk REST API tanpa server-side session storage]

---

> **Superadmin Credentials (untuk submission / testing):**  
> Email: `superadmin@warisanlink.id`  
> Password: `Admin@Warisan123`  
> 
> **⚠️ Ganti password setelah submission jika platform tetap live!**
