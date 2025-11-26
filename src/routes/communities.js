import express from 'express';
import { body } from 'express-validator';
import {
    createCommunity,
    getCommunities,
    getCommunity,
    updateCommunity,
    joinCommunity,
    leaveCommunity,
    getCommunityPosts,
} from '../controllers/communityController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

const createValidation = [
    body('name').trim().isLength({ min: 3, max: 30 }),
    body('displayName').trim().isLength({ min: 1, max: 50 }),
    body('description').isLength({ min: 1, max: 500 }),
];

router.post('/', authenticate, createValidation, validate, createCommunity);
router.get('/', getCommunities);
router.get('/:id', getCommunity);
router.put('/:id', authenticate, updateCommunity);
router.post('/:id/join', authenticate, joinCommunity);
router.delete('/:id/leave', authenticate, leaveCommunity);
router.get('/:id/posts', getCommunityPosts);

export default router;
