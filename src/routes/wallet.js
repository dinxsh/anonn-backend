import express from 'express';
import { body } from 'express-validator';
import {
    linkWallet,
    unlinkWallet,
    getWalletInfo,
    getBalance,
    signTransaction,
    verifySignature,
} from '../controllers/walletController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

const linkValidation = [
    body('address').isEthereumAddress().withMessage('Invalid wallet address'),
    body('chain').isIn(['ethereum', 'polygon', 'binance', 'solana', 'arbitrum', 'optimism']),
    body('signature').notEmpty(),
];

router.post('/link', authenticate, linkValidation, validate, linkWallet);
router.delete('/:id/unlink', authenticate, unlinkWallet);
router.get('/', authenticate, getWalletInfo);
router.get('/:id/balance', authenticate, getBalance);
router.post('/sign', authenticate, signTransaction);
router.post('/verify', verifySignature);

export default router;
