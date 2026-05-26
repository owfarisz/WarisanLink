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
