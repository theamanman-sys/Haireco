import { Router } from 'express';
import authRoutes from './auth.routes';
import salonRoutes from './salon.routes';
import bookingRoutes from './booking.routes';
import marketplaceRoutes from './marketplace.routes';
import jobRoutes from './job.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/salons', salonRoutes);
router.use('/bookings', bookingRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/jobs', jobRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);

export default router;
