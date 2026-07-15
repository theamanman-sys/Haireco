import { Router } from 'express';
import {
  createSalon,
  getSalons,
  getSalonById,
  getNearbySalons,
  updateSalon,
  createService,
  getSalonServices,
  manageStaff,
} from '../controllers/salon.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getSalons as any);
router.get('/nearby', getNearbySalons as any);
router.get('/:id', getSalonById as any);
router.post('/', authenticate, authorize('SALON_OWNER'), createSalon as any);
router.put('/:id', authenticate, authorize('SALON_OWNER'), updateSalon as any);

router.get('/:salonId/services', getSalonServices as any);
router.post('/:salonId/services', authenticate, authorize('SALON_OWNER'), createService as any);

router.post('/:salonId/staff', authenticate, authorize('SALON_OWNER'), manageStaff as any);

export default router;
