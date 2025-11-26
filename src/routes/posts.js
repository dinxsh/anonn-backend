import express from 'express';
import { body } from 'express-validator';
import {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost,
    votePost,
    addComment,
    getComments,
    sharePost,
    searchPosts,
} from '../controllers/postController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { createContentLimiter, voteLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Post Routes
 * Handles post CRUD, voting, comments, and filtering
 */

// Validation rules
const createPostValidation = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 300 })
        .withMessage('Title must be 1-300 characters'),
    body('content')
        .trim()
        .isLength({ min: 1, max: 10000 })
        .withMessage('Content must be 1-10000 characters'),
];

const voteValidation = [
    body('voteType')
        .isIn(['upvote', 'downvote'])
        .withMessage('Invalid vote type'),
];

const commentValidation = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Comment must be 1-2000 characters'),
];

// Routes
// POST /api/posts - Create post
router.post('/', authenticate, createContentLimiter, createPostValidation, validate, createPost);

// GET /api/posts - Get posts with filters
router.get('/', optionalAuth, getPosts);

// GET /api/posts/search - Search posts
router.get('/search', searchPosts);

// GET /api/posts/:id - Get single post
router.get('/:id', optionalAuth, getPost);

// PUT /api/posts/:id - Update post
router.put('/:id', authenticate, updatePost);

// DELETE /api/posts/:id - Delete post
router.delete('/:id', authenticate, deletePost);

// POST /api/posts/:id/vote - Vote on post
router.post('/:id/vote', authenticate, voteLimiter, voteValidation, validate, votePost);

// POST /api/posts/:id/comments - Add comment
router.post('/:id/comments', authenticate, commentValidation, validate, addComment);

// GET /api/posts/:id/comments - Get comments
router.get('/:id/comments', getComments);

// POST /api/posts/:id/share - Increment share count
router.post('/:id/share', sharePost);

export default router;
