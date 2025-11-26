import express from 'express';
import { body } from 'express-validator';
import {
    createBowl,
    getBowls,
    getBowl,
    joinBowl,
    leaveBowl,
} from '../controllers/bowlController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

const createValidation = [
    body('name').trim().isLength({ min: 3, max: 30 }),
    body('displayName').trim().isLength({ min: 1, max: 50 }),
    body('description').isLength({ min: 1, max: 500 }),
];

router.post('/', authenticate, createValidation, validate, createBowl);
router.get('/', getBowls);
router.get('/:id', getBowl);
router.post('/:id/join', authenticate, joinBowl);
router.delete('/:id/leave', authenticate, leaveBowl);

export default router;
