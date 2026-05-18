import * as categoryService from './category.service.js';

export const getAll = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(200).json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};
