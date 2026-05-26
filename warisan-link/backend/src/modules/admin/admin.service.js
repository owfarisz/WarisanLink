import { prisma } from '../../config/db.js';

export const getUsers = async ({ status, role, page = 1, limit = 20 }) => {
  const where = {};
  if (status) where.status = status;
  if (role) where.role = role;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, name: true, role: true,
        status: true, organization: true, bio: true, createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const updateUserStatus = async (userId, status, adminId) => {
  if (adminId === userId) {
    const err = new Error('Tidak dapat mengubah status diri sendiri');
    err.code = 'SELF_UPDATE';
    throw err;
  }
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
