import { Router } from 'express';
import {
  createBooking,
  getUserBookings,
  getSalonBookings,
  updateBookingStatus,
  getQueue,
  joinQueue,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createBooking as any);
router.get('/my', authenticate, getUserBookings as any);
router.get('/salon/:salonId', authenticate, getSalonBookings as any);
router.put('/:id/status', authenticate, updateBookingStatus as any);

router.get('/queue/:salonId', getQueue as any);
router.post('/queue', authenticate, joinQueue as any);

export default router;
