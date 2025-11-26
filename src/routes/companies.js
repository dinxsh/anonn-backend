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

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Companies
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - ticker
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ethereum Foundation
 *               ticker:
 *                 type: string
 *                 example: ETH
 *               description:
 *                 type: string
 *                 example: Decentralized smart contract platform
 *     responses:
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', authenticate, createCompanyValidation, validate, createCompany);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or ticker
 *     responses:
 *       200:
 *         description: Companies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/', getCompanies);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get a single company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID or Ticker
 *     responses:
 *       200:
 *         description: Company retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', getCompany);

/**
 * @swagger
 * /api/companies/{id}/sentiment:
 *   post:
 *     summary: Add sentiment (bullish/bearish)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [bullish, bearish]
 *     responses:
 *       200:
 *         description: Sentiment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/sentiment', authenticate, addSentiment);

/**
 * @swagger
 * /api/companies/{id}/posts:
 *   get:
 *     summary: Get posts related to a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/:id/posts', getCompanyPosts);

/**
 * @swagger
 * /api/companies/{id}/markets:
 *   post:
 *     summary: Create a prediction market for a company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - expiresAt
 *             properties:
 *               question:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Market created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/markets', authenticate, createMarket);

/**
 * @swagger
 * /api/companies/{id}/markets:
 *   get:
 *     summary: Get markets for a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Markets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/:id/markets', getCompanyMarkets);

/**
 * @swagger
 * /api/companies/{id}/markets/{marketId}/trade:
 *   post:
 *     summary: Trade on a market
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *       - in: path
 *         name: marketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Market ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - outcome
 *               - amount
 *               - side
 *             properties:
 *               outcome:
 *                 type: string
 *                 enum: [YES, NO]
 *               amount:
 *                 type: number
 *               side:
 *                 type: string
 *                 enum: [buy, sell]
 *     responses:
 *       200:
 *         description: Trade executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/markets/:marketId/trade', authenticate, tradeMarket);

export default router;
