import { Router } from 'express';
import {
  getSubscriptionPlans,
  subscribe,
  getPaymentHistory,
  createAdvertisement,
  getActiveAds,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/subscriptions', getSubscriptionPlans as any);
router.post('/subscribe', authenticate, subscribe as any);

router.get('/history', authenticate, getPaymentHistory as any);

router.get('/ads', getActiveAds as any);
router.post('/ads', authenticate, createAdvertisement as any);

export default router;
