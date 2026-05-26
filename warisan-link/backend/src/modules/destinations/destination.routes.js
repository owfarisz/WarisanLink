import { Router } from 'express';
import * as destinationController from './destination.controller.js';
import { validate } from '../../middlewares/validate.js';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware.js';
import { uploadImage } from '../../config/multer.js';
import { listDestinationsQuery } from './destination.schema.js';

const router = Router();

// ── Protected routes (order matters: before /:slug) ──────────
router.get(
  '/my/destinations',
  verifyToken,
  requireRole('KONTRIBUTOR'),
  destinationController.getMyDestinations
);

router.post(
  '/',
  verifyToken,
  requireRole('KONTRIBUTOR', 'SUPERADMIN'),
  uploadImage.single('coverImage'),
  destinationController.createDestination
);

router.delete(
  '/:id',
  verifyToken,
  requireRole('KONTRIBUTOR', 'SUPERADMIN'),
  destinationController.deleteDestination
);

// ── Public routes ─────────────────────────────────────────────
router.get('/', validate(listDestinationsQuery), destinationController.list);
router.get('/search', validate(listDestinationsQuery), destinationController.list);
router.get('/:slug', destinationController.getBySlug);

export default router;
