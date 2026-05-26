import prisma from '../../config/db.js';
import { paginate, buildPagination } from '../../utils/paginate.js';
import { slugify } from '../../utils/slugify.js';

export const getDestinations = async (query) => {
  const { page, limit, skip, take } = paginate(query.page, query.limit);

  const where = {
    destStatus: 'PUBLISHED', // hanya tampilkan yang sudah diapprove
  };

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

export const createDestination = async (data) => {
  const baseSlug = slugify(`${data.name}-${data.city}`);
  // Pastikan slug unik dengan tambah timestamp jika sudah ada
  const existing = await prisma.destination.findUnique({ where: { slug: baseSlug } });
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  return prisma.destination.create({
    data: {
      slug,
      name: data.name,
      city: data.city,
      province: data.province,
      categoryId: data.categoryId,
      shortDesc: data.shortDesc,
      culturalMeaning: data.culturalMeaning,
      localHistory: data.localHistory,
      malaysiaConnection: data.malaysiaConnection || '',
      localEtiquette: data.localEtiquette || null,
      coverImageUrl: data.coverImageUrl,
      creatorId: data.creatorId,
      destStatus: 'PENDING', // menunggu approval Superadmin
    },
  });
};

export const getDestinationsByCreator = async (creatorId) => {
  return prisma.destination.findMany({
    where: { creatorId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const deleteDestination = async (id, userId, role) => {
  const dest = await prisma.destination.findUnique({ where: { id } });
  if (!dest) {
    const err = new Error('Destinasi tidak ditemukan');
    err.code = 'NOT_FOUND';
    throw err;
  }
  if (role === 'KONTRIBUTOR' && dest.creatorId !== userId) {
    const err = new Error('Bukan destinasi Anda');
    err.code = 'NOT_OWNER';
    throw err;
  }
  await prisma.destination.delete({ where: { id } });
};
