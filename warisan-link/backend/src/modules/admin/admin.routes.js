import { Router } from 'express';
import * as adminController from './admin.controller.js';

const router = Router();

// Semua route sudah diproteksi verifyToken + requireRole('SUPERADMIN') di app.js
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/stats', adminController.getStats);
router.put('/destinations/:id/moderate', adminController.moderateDestination);

export default router;
