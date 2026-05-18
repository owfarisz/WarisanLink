import * as compassService from './compass.service.js';

export const getByDestinationSlug = async (req, res, next) => {
  try {
    const compass = await compassService.getCompassByDestinationSlug(req.params.destinationSlug);
    res.status(200).json(compass);
  } catch (err) {
    next(err);
  }
};
