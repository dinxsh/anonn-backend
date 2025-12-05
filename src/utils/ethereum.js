import { ethers } from 'ethers';
import crypto from 'crypto';

/**
 * Ethereum Wallet Authentication Utilities
 * Handles MetaMask and other Ethereum wallet signature verification
 */

// In-memory nonce storage with TTL (5 minutes) - shared with Solana
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
 * @param {string} address - Ethereum address (0x...)
 * @param {string} nonce - Generated nonce
 * @param {string} message - Formatted message to sign
 */
export const storeNonce = (address, nonce, message) => {
    const normalizedAddress = address.toLowerCase();
    const expiresAt = Date.now() + NONCE_TTL;
    nonceStore.set(normalizedAddress, { nonce, message, expiresAt });

    // Cleanup expired nonces periodically
    cleanupExpiredNonces();
};

/**
 * Retrieve and validate nonce
 * @param {string} address - Ethereum address (0x...)
 * @returns {object|null} Object with nonce and message if valid, null if expired or not found
 */
export const getNonce = (address) => {
    const normalizedAddress = address.toLowerCase();
    const stored = nonceStore.get(normalizedAddress);

    if (!stored) {
        return null;
    }

    if (Date.now() > stored.expiresAt) {
        nonceStore.delete(normalizedAddress);
        return null;
    }

    return { nonce: stored.nonce, message: stored.message };
};

/**
 * Remove used nonce (one-time use)
 * @param {string} address - Ethereum address (0x...)
 */
export const removeNonce = (address) => {
    const normalizedAddress = address.toLowerCase();
    nonceStore.delete(normalizedAddress);
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
 * Format message for wallet signing (EIP-191 personal sign)
 * @param {string} nonce - Unique nonce
 * @param {string} action - Action being performed (default: 'authentication')
 * @returns {string} Formatted message
 */
export const formatWalletMessage = (nonce, action = 'authentication') => {
    const timestamp = new Date().toISOString();
    return `Sign this message to authenticate with Anonn:\n\nAction: ${action}\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
};

/**
 * Verify Ethereum wallet signature (EIP-191 personal_sign)
 * @param {string} message - Original message that was signed
 * @param {string} signature - Hex signature (0x...)
 * @param {string} address - Ethereum address (0x...)
 * @returns {boolean} True if signature is valid
 */
export const verifySignature = (message, signature, address) => {
    try {
        // Recover the address from the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);
        
        // Compare addresses (case-insensitive)
        const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
        
        return isValid;
    } catch (error) {
        console.error('Ethereum signature verification error:', error);
        return false;
    }
};

/**
 * Validate Ethereum address format
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid Ethereum address
 */
export const isValidEthereumAddress = (address) => {
    try {
        return ethers.isAddress(address);
    } catch (error) {
        return false;
    }
};

/**
 * Generate username from wallet address
 * @param {string} address - Ethereum address
 * @returns {string} Generated username
 */
export const generateUsernameFromWallet = (address) => {
    // Take first 8 characters after 0x
    const prefix = address.substring(2, 10);
    return `wallet_${prefix}`;
};

/**
 * Normalize Ethereum address to checksum format
 * @param {string} address - Ethereum address
 * @returns {string} Checksummed address
 */
export const normalizeAddress = (address) => {
    try {
        return ethers.getAddress(address); // Returns checksummed address
    } catch (error) {
        return address.toLowerCase();
    }
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
    isValidEthereumAddress,
    generateUsernameFromWallet,
    normalizeAddress,
};
