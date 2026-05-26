import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';

const signToken = (user) =>
  jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

const safeUser = ({ password, ...rest }) => rest;

export const register = async (data) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const err = new Error('Email sudah terdaftar');
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  const hashed = await bcrypt.hash(data.password, 12);
  // Turis langsung aktif, Kontributor harus approval Superadmin
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
    select: {
      id: true, email: true, name: true, role: true,
      status: true, organization: true, bio: true, createdAt: true,
    },
  });
  if (!user) throw new Error('User tidak ditemukan');
  return user;
};
