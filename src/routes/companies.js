import express from 'express';
import { body } from 'express-validator';
import {
    createCompany,
    getCompanies,
    getCompany,
    addSentiment,
    getCompanyPosts,
    createMarket,
    getCompanyMarkets,
    tradeMarket,
} from '../controllers/companyController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

const createCompanyValidation = [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('ticker').trim().isLength({ min: 1, max: 10 }),
    body('description').isLength({ min: 1, max: 1000 }),
];

router.post('/', authenticate, createCompanyValidation, validate, createCompany);
router.get('/', getCompanies);
router.get('/:id', getCompany);
router.post('/:id/sentiment', authenticate, addSentiment);
router.get('/:id/posts', getCompanyPosts);
router.post('/:id/markets', authenticate, createMarket);
router.get('/:id/markets', getCompanyMarkets);
router.post('/:id/markets/:marketId/trade', authenticate, tradeMarket);

export default router;
