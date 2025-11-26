import express from 'express';
import { body, param } from 'express-validator';
import {
    getUserProfile,
    updateUserProfile,
    followUser,
    unfollowUser,
    addBookmark,
    removeBookmark,
    getBookmarks,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

/**
 * User Routes
 * Handles user profile management and social features
 */

// Validation rules
const updateProfileValidation = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be 3-30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),
    body('avatar')
        .optional()
        .isURL()
        .withMessage('Avatar must be a valid URL'),
];

const addBookmarkValidation = [
    body('type')
        .isIn(['post', 'poll', 'comment', 'user'])
        .withMessage('Invalid bookmark type'),
    body('itemId')
        .isMongoId()
        .withMessage('Invalid item ID'),
];

// Routes
// GET /api/users/:id - Get user profile
router.get('/:id', getUserProfile);

// PUT /api/users/:id - Update user profile
router.put('/:id', authenticate, updateProfileValidation, validate, updateUserProfile);

// POST /api/users/:id/follow - Follow user
router.post('/:id/follow', authenticate, followUser);

// DELETE /api/users/:id/follow - Unfollow user
router.delete('/:id/follow', authenticate, unfollowUser);

// POST /api/users/bookmarks - Add bookmark
router.post('/bookmarks', authenticate, addBookmarkValidation, validate, addBookmark);

// DELETE /api/users/bookmarks/:id - Remove bookmark
router.delete('/bookmarks/:id', authenticate, removeBookmark);

// GET /api/users/bookmarks - Get all bookmarks
router.get('/bookmarks', authenticate, getBookmarks);

export default router;
