import { Router } from 'express';
import * as compassController from './compass.controller.js';

const router = Router();

router.get('/:destinationSlug', compassController.getByDestinationSlug);

export default router;
