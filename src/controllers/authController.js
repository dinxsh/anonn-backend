import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';
import * as solanaUtils from '../utils/solana.js';
import * as ethereumUtils from '../utils/ethereum.js';

/**
 * Auth Controller
 * Handles user authentication: register, login, logout, refresh, current user
 * + Multi-chain wallet authentication (Solana, Ethereum)
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return errorResponse(res, 400, 'Email already registered');
            }
            if (existingUser.username === username) {
                return errorResponse(res, 400, 'Username already taken');
            }
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            authMethod: 'email',
        });

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return successResponse(res, 201, {
            user: userResponse,
            accessToken,
            refreshToken,
        }, 'User registered successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return errorResponse(res, 401, 'Invalid credentials');
        }

        // Check password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return errorResponse(res, 401, 'Invalid credentials');
        }

        // Check if account is active
        if (!user.isActive) {
            return errorResponse(res, 403, 'Account is deactivated');
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return successResponse(res, 200, {
            user: userResponse,
            accessToken,
            refreshToken,
        }, 'Login successful');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client should remove tokens)
 * @access  Private
 */
export const logout = async (req, res, next) => {
    try {
        // In a production app, you might want to implement token blacklisting
        // For now, logout is handled client-side by removing tokens
        return successResponse(res, 200, {}, 'Logout successful');
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
export const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return errorResponse(res, 400, 'Refresh token is required');
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Generate new access token
        const accessToken = generateAccessToken(decoded.id);

        return successResponse(res, 200, {
            accessToken,
        }, 'Token refreshed successfully');

    } catch (error) {
        return errorResponse(res, 401, 'Invalid or expired refresh token');
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
export const getCurrentUser = async (req, res, next) => {
    try {
        // User is already attached by auth middleware
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('joinedCommunities', 'name displayName avatar')
            .populate('joinedBowls', 'name displayName icon');

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        return successResponse(res, 200, { user }, 'User retrieved successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/wallet/nonce
 * @desc    Request nonce for wallet authentication (Solana or Ethereum)
 * @access  Public
 */
export const requestWalletNonce = async (req, res, next) => {
    try {
        const { publicKey, address, chain = 'solana' } = req.body;
        const walletIdentifier = publicKey || address;

        if (!walletIdentifier) {
            return errorResponse(res, 400, 'Wallet address or public key is required');
        }

        // Select appropriate utils based on chain
        const utils = chain === 'ethereum' ? ethereumUtils : solanaUtils;

        // Validate address format
        const isValid = chain === 'ethereum' 
            ? utils.isValidEthereumAddress(walletIdentifier)
            : utils.isValidSolanaAddress(walletIdentifier);

        if (!isValid) {
            return errorResponse(res, 400, `Invalid ${chain} address`);
        }

        // Generate and store nonce
        const nonce = utils.generateNonce();

        // Format message to sign
        const message = utils.formatWalletMessage(nonce, 'authentication');
        
        // Store nonce with the message
        utils.storeNonce(walletIdentifier, nonce, message);

        return successResponse(res, 200, {
            nonce,
            message,
            chain,
            expiresIn: 300, // 5 minutes in seconds
        }, 'Nonce generated successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/wallet/verify
 * @desc    Verify wallet signature and login/register (Solana or Ethereum)
 * @access  Public
 */
export const walletAuth = async (req, res, next) => {
    try {
        const { publicKey, address, signature, username, chain = 'solana' } = req.body;
        const walletIdentifier = publicKey || address;

        if (!walletIdentifier) {
            return errorResponse(res, 400, 'Wallet address or public key is required');
        }

        // Select appropriate utils based on chain
        const utils = chain === 'ethereum' ? ethereumUtils : solanaUtils;

        // Validate address format
        const isValid = chain === 'ethereum'
            ? utils.isValidEthereumAddress(walletIdentifier)
            : utils.isValidSolanaAddress(walletIdentifier);

        if (!isValid) {
            return errorResponse(res, 400, `Invalid ${chain} address`);
        }

        // Retrieve stored nonce and message
        const stored = utils.getNonce(walletIdentifier);
        if (!stored) {
            return errorResponse(res, 400, 'Nonce not found or expired. Please request a new nonce.');
        }

        const { nonce: storedNonce, message } = stored;

        // Verify signature using the stored message
        const signatureValid = utils.verifySignature(message, signature, walletIdentifier);
        if (!signatureValid) {
            return errorResponse(res, 401, 'Invalid signature');
        }

        // Remove used nonce (one-time use)
        utils.removeNonce(walletIdentifier);

        // Normalize address for storage
        const normalizedAddress = chain === 'ethereum' && utils.normalizeAddress
            ? utils.normalizeAddress(walletIdentifier)
            : walletIdentifier;

        // Check if user already exists with this wallet
        let user = await User.findOne({ primaryWallet: normalizedAddress });

        if (user) {
            // Existing user - login
            if (!user.isActive) {
                return errorResponse(res, 403, 'Account is deactivated');
            }
        } else {
            // New user - register
            const generatedUsername = username || utils.generateUsernameFromWallet(normalizedAddress);

            // Check if username is taken
            const existingUsername = await User.findOne({ username: generatedUsername });
            if (existingUsername) {
                return errorResponse(res, 400, 'Username already taken. Please provide a custom username.');
            }

            // Create new user with wallet authentication
            user = await User.create({
                username: generatedUsername,
                authMethod: 'wallet',
                primaryWallet: normalizedAddress,
                walletAddresses: [{
                    address: normalizedAddress,
                    chain: chain,
                    isPrimary: true,
                    verified: true,
                }],
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return successResponse(res, user.isNew ? 201 : 200, {
            user: userResponse,
            accessToken,
            refreshToken,
            isNewUser: user.isNew || false,
        }, user.isNew ? 'Account created successfully' : 'Login successful');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/wallet/link
 * @desc    Link wallet to existing authenticated account (Solana or Ethereum)
 * @access  Private
 */
export const linkWallet = async (req, res, next) => {
    try {
        const { publicKey, address, signature, chain = 'solana' } = req.body;
        const userId = req.user._id;
        const walletIdentifier = publicKey || address;

        if (!walletIdentifier) {
            return errorResponse(res, 400, 'Wallet address or public key is required');
        }

        // Select appropriate utils based on chain
        const utils = chain === 'ethereum' ? ethereumUtils : solanaUtils;

        // Validate address format
        const isValid = chain === 'ethereum'
            ? utils.isValidEthereumAddress(walletIdentifier)
            : utils.isValidSolanaAddress(walletIdentifier);

        if (!isValid) {
            return errorResponse(res, 400, `Invalid ${chain} address`);
        }

        // Normalize address for storage
        const normalizedAddress = chain === 'ethereum' && utils.normalizeAddress
            ? utils.normalizeAddress(walletIdentifier)
            : walletIdentifier;

        // Check if wallet is already linked to another account
        const existingWallet = await User.findOne({ primaryWallet: normalizedAddress });
        if (existingWallet && existingWallet._id.toString() !== userId.toString()) {
            return errorResponse(res, 400, 'This wallet is already linked to another account');
        }

        // Retrieve stored nonce and message
        const stored = utils.getNonce(walletIdentifier);
        if (!stored) {
            return errorResponse(res, 400, 'Nonce not found or expired. Please request a new nonce.');
        }

        const { nonce: storedNonce, message } = stored;

        // Verify signature using the stored message
        const signatureValid = utils.verifySignature(message, signature, walletIdentifier);
        if (!signatureValid) {
            return errorResponse(res, 401, 'Invalid signature');
        }

        // Remove used nonce
        utils.removeNonce(walletIdentifier);

        // Update user
        const user = await User.findById(userId);

        // Set primary wallet if not already set
        if (!user.primaryWallet) {
            user.primaryWallet = normalizedAddress;
        }

        // Add to wallet addresses if not already there
        const walletExists = user.walletAddresses.some(w => 
            w.address.toLowerCase() === normalizedAddress.toLowerCase()
        );
        if (!walletExists) {
            user.walletAddresses.push({
                address: normalizedAddress,
                chain: chain,
                isPrimary: !user.primaryWallet || user.primaryWallet === normalizedAddress,
                verified: true,
            });
        }

        // Update auth method
        if (user.authMethod === 'email') {
            user.authMethod = 'both';
        } else if (user.authMethod === 'wallet' && !user.email) {
            // Keep as wallet-only if no email
            user.authMethod = 'wallet';
        }

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return successResponse(res, 200, {
            user: userResponse,
            wallets: user.walletAddresses,
        }, 'Wallet linked successfully');

    } catch (error) {
        next(error);
    }
};

export default {
    register,
    login,
    logout,
    refresh,
    getCurrentUser,
    requestWalletNonce,
    walletAuth,
    linkWallet,
};
