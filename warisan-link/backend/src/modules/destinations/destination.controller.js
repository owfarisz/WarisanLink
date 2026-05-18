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
