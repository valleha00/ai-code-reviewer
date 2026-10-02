import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

// POST /api/v1/review/analyze with rate limiting
router.post('/analyze', apiRateLimiter, ReviewController.analyze);

// GET /api/v1/review/presets
router.get('/presets', ReviewController.getPresets);

// GET /api/v1/review/history
router.get('/history', ReviewController.getHistory);

export const reviewRouter = router;
