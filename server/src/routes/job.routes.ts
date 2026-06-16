import { Router } from 'express';
import {
  createJobPost,
  getJobPosts,
  getJobPostById,
  applyForJob,
  updateApplicationStatus,
} from '../controllers/job.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getJobPosts as any);
router.get('/:id', getJobPostById as any);
router.post('/', authenticate, authorize('SALON_OWNER'), createJobPost as any);

router.post('/:jobId/apply', authenticate, authorize('PROFESSIONAL'), applyForJob as any);
router.put('/applications/:applicationId/status', authenticate, authorize('SALON_OWNER'), updateApplicationStatus as any);

export default router;
