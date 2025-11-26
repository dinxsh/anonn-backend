import express from 'express';
import {
    getRecommendedFeed,
    getFollowingFeed,
    getForYouFeed,
} from '../controllers/feedController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/recommended', getRecommendedFeed);
router.get('/following', authenticate, getFollowingFeed);
router.get('/for-you', authenticate, getForYouFeed);

export default router;
