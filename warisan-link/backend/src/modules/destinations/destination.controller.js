import * as destinationService from './destination.service.js';

export const list = async (req, res, next) => {
  try {
    const result = await destinationService.getDestinations(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getBySlug = async (req, res, next) => {
  try {
    const destination = await destinationService.getDestinationBySlug(req.params.slug);
    res.status(200).json(destination);
  } catch (err) {
    next(err);
  }
};

export const createDestination = async (req, res, next) => {
  try {
    const {
      name, city, province, categoryId,
      shortDesc, culturalMeaning, localHistory,
      malaysiaConnection, localEtiquette,
    } = req.body;

    const coverImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const destination = await destinationService.createDestination({
      name,
      city,
      province,
      categoryId: parseInt(categoryId),
      shortDesc,
      culturalMeaning,
      localHistory,
      malaysiaConnection,
      localEtiquette,
      coverImageUrl,
      creatorId: req.user.userId,
    });

    res.status(201).json({ success: true, data: destination });
  } catch (err) {
    next(err);
  }
};

export const getMyDestinations = async (req, res, next) => {
  try {
    const destinations = await destinationService.getDestinationsByCreator(req.user.userId);
    res.json({ success: true, data: destinations });
  } catch (err) {
    next(err);
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    await destinationService.deleteDestination(
      parseInt(req.params.id),
      req.user.userId,
      req.user.role
    );
    res.json({ success: true, message: 'Destinasi dihapus' });
  } catch (err) {
    if (err.code === 'NOT_OWNER') {
      return res.status(403).json({ success: false, error: err.message });
    }
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ success: false, error: err.message });
    }
    next(err);
  }
};
