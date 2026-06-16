import { Router } from 'express';
import { createReview, getSalonReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createReview as any);
router.get('/salon/:salonId', getSalonReviews as any);

export default router;
