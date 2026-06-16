import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  createOrder,
  getUserOrders,
} from '../controllers/marketplace.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/products', getProducts as any);
router.get('/products/:id', getProductById as any);
router.post('/products', authenticate, authorize('SHOP'), createProduct as any);

router.post('/orders', authenticate, createOrder as any);
router.get('/orders/my', authenticate, getUserOrders as any);

export default router;
