import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';
import crypto from 'crypto';

/**
 * Solana Wallet Authentication Utilities
 * Handles signature verification and nonce generation
 */

// In-memory nonce storage with TTL (5 minutes)
const nonceStore = new Map();
const NONCE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Generate a unique nonce for wallet authentication
 * @returns {string} Random nonce string
 */
export const generateNonce = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Store nonce with expiration
 * @param {string} publicKey - Solana public key
 * @param {string} nonce - Generated nonce
 * @param {string} message - Formatted message to sign
 */
export const storeNonce = (publicKey, nonce, message) => {
    const expiresAt = Date.now() + NONCE_TTL;
    nonceStore.set(publicKey, { nonce, message, expiresAt });

    // Cleanup expired nonces periodically
    cleanupExpiredNonces();
};

/**
 * Retrieve and validate nonce
 * @param {string} publicKey - Solana public key
 * @returns {object|null} Object with nonce and message if valid, null if expired or not found
 */
export const getNonce = (publicKey) => {
    const stored = nonceStore.get(publicKey);

    if (!stored) {
        return null;
    }

    if (Date.now() > stored.expiresAt) {
        nonceStore.delete(publicKey);
        return null;
    }

    return { nonce: stored.nonce, message: stored.message };
};

/**
 * Remove used nonce (one-time use)
 * @param {string} publicKey - Solana public key
 */
export const removeNonce = (publicKey) => {
    nonceStore.delete(publicKey);
};

/**
 * Clean up expired nonces from memory
 */
const cleanupExpiredNonces = () => {
    const now = Date.now();
    for (const [key, value] of nonceStore.entries()) {
        if (now > value.expiresAt) {
            nonceStore.delete(key);
        }
    }
};

/**
 * Format message for wallet signing
 * @param {string} nonce - Unique nonce
 * @param {string} action - Action being performed (default: 'authentication')
 * @returns {string} Formatted message
 */
export const formatWalletMessage = (nonce, action = 'authentication') => {
    const timestamp = new Date().toISOString();
    return `Sign this message to authenticate with Anonn:\n\nAction: ${action}\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
};

/**
 * Verify Solana wallet signature
 * @param {string} message - Original message that was signed
 * @param {string} signature - Base58 encoded signature
 * @param {string} publicKey - Base58 encoded public key
 * @returns {boolean} True if signature is valid
 */
export const verifySignature = (message, signature, publicKey) => {
    try {
        // Decode the signature and public key from base58
        const signatureBytes = bs58.decode(signature);
        const publicKeyBytes = bs58.decode(publicKey);

        // Convert message to Uint8Array
        const messageBytes = new TextEncoder().encode(message);

        // Verify the signature
        const isValid = nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKeyBytes
        );

        return isValid;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};

/**
 * Validate Solana public key format
 * @param {string} publicKey - Public key to validate
 * @returns {boolean} True if valid Solana public key
 */
export const isValidSolanaAddress = (publicKey) => {
    try {
        new PublicKey(publicKey);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Generate username from wallet address
 * @param {string} publicKey - Solana public key
 * @returns {string} Generated username
 */
export const generateUsernameFromWallet = (publicKey) => {
    // Take first 8 characters of the public key
    const prefix = publicKey.substring(0, 8);
    return `wallet_${prefix}`;
};

// Run cleanup every minute
setInterval(cleanupExpiredNonces, 60 * 1000);

export default {
    generateNonce,
    storeNonce,
    getNonce,
    removeNonce,
    formatWalletMessage,
    verifySignature,
    isValidSolanaAddress,
    generateUsernameFromWallet,
};
