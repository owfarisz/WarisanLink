import { Router } from 'express';
import * as destinationController from './destination.controller.js';
import { validate } from '../../middlewares/validate.js';
import { listDestinationsQuery } from './destination.schema.js';

const router = Router();

router.get('/', validate(listDestinationsQuery), destinationController.list);
router.get('/search', validate(listDestinationsQuery), destinationController.list);
router.get('/:slug', destinationController.getBySlug);

export default router;
