import prisma from '../../config/db.js';

export const getCompassByDestinationSlug = async (slug) => {
  const destination = await prisma.destination.findUnique({
    where: { slug },
    include: { accessCompass: true },
  });

  if (!destination) {
    throw new Error('Destinasi tidak ditemukan');
  }

  if (!destination.accessCompass) {
    throw new Error('Access Compass belum tersedia untuk destinasi ini');
  }

  return destination.accessCompass;
};
