import { errorResponse } from '../utils/response.js';

/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error response
 */

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message,
        }));
        return errorResponse(res, 400, 'Validation error', errors);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return errorResponse(res, 400, `${field} already exists`);
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return errorResponse(res, 400, 'Invalid ID format');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 401, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Token expired');
    }

    // Default error
    return errorResponse(
        res,
        err.statusCode || 500,
        err.message || 'Internal Server Error'
    );
};

export default errorHandler;
