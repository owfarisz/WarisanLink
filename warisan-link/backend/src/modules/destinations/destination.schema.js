import { z } from 'zod';

export const listDestinationsQuery = z.object({
  category: z.string().optional(),
  province: z.string().optional(),
  accessLevel: z.enum(['EASY', 'MODERATE', 'REMOTE']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.enum(['newest', 'popular']).default('newest'),
});
