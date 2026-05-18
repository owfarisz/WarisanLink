import prisma from '../../config/db.js';
import { slugify } from '../../utils/slugify.js';

export const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
};

export const createCategory = async (data) => {
  const slug = data.slug || slugify(data.name);
  return prisma.category.create({
    data: { ...data, slug },
  });
};

export const updateCategory = async (id, data) => {
  if (data.name && !data.slug) {
    data.slug = slugify(data.name);
  }
  return prisma.category.update({
    where: { id: parseInt(id) },
    data,
  });
};

export const deleteCategory = async (id) => {
  return prisma.category.delete({
    where: { id: parseInt(id) },
  });
};
