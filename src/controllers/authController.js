import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Auth Controller
 * Handles user authentication: register, login, logout, refresh, current user
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
