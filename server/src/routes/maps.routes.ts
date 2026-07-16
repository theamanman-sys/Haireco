import { Router } from 'express';
import { searchNearbyPlaces } from '../controllers/maps.controller';

const router = Router();

router.get('/nearby', searchNearbyPlaces as any);

export default router;
