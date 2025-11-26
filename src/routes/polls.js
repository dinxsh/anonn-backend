import express from 'express';
import { body } from 'express-validator';
import {
    createPoll,
    getPoll,
    votePoll,
    getPolls,
    updatePoll,
    deletePoll,
} from '../controllers/pollController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { createContentLimiter, voteLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Poll Routes
 * Handles poll CRUD and voting
 */

// Validation rules
const createPollValidation = [
    body('question')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Question must be 1-500 characters'),
    body('options')
        .isArray({ min: 2, max: 4 })
        .withMessage('Poll must have 2-4 options'),
    body('expiresAt')
        .isISO8601()
        .withMessage('Invalid expiry date'),
];

const voteValidation = [
    body('optionIndex')
        .isInt({ min: 0, max: 3 })
        .withMessage('Invalid option index'),
];

// Routes
// POST /api/polls - Create poll
router.post('/', authenticate, createContentLimiter, createPollValidation, validate, createPoll);

// GET /api/polls - Get polls with filters
router.get('/', optionalAuth, getPolls);

// GET /api/polls/:id - Get poll with results
router.get('/:id', optionalAuth, getPoll);

// PUT /api/polls/:id - Update poll
router.put('/:id', authenticate, updatePoll);

// DELETE /api/polls/:id - Delete poll
router.delete('/:id', authenticate, deletePoll);

// POST /api/polls/:id/vote - Vote on poll
router.post('/:id/vote', authenticate, voteLimiter, voteValidation, validate, votePoll);

export default router;
