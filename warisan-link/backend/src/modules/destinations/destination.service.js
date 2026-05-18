import prisma from '../../config/db.js';
import { paginate, buildPagination } from '../../utils/paginate.js';

export const getDestinations = async (query) => {
  const { page, limit, skip, take } = paginate(query.page, query.limit);

  const where = {};
  if (query.category) {
    where.category = { slug: query.category };
  }
  if (query.province) {
    where.province = query.province;
  }
  if (query.accessLevel) {
    where.accessCompass = { accessLevel: query.accessLevel };
  }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { shortDesc: { contains: query.search, mode: 'insensitive' } },
      { city: { contains: query.search, mode: 'insensitive' } },
      { province: { contains: query.search, mode: 'insensitive' } },
      { culturalMeaning: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const orderBy = query.sort === 'popular' ? { viewCount: 'desc' } : { createdAt: 'desc' };

  const [data, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: true,
        accessCompass: true,
      },
    }),
    prisma.destination.count({ where }),
  ]);

  return {
    data,
    pagination: buildPagination(total, page, limit),
  };
};

export const getDestinationBySlug = async (slug) => {
  const destination = await prisma.destination.findUnique({
    where: { slug },
    include: {
      category: true,
      accessCompass: true,
    },
  });

  if (!destination) {
    throw new Error('Destinasi tidak ditemukan');
  }

  await prisma.destination.update({
    where: { id: destination.id },
    data: { viewCount: { increment: 1 } },
  });

  return destination;
};
