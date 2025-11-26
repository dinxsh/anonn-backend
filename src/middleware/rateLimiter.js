import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP
 */

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth routes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
    },
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Create post/poll rate limiter
export const createContentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 posts/polls per hour
    message: {
        success: false,
        message: 'Too many posts created, please try again later.',
    },
});

// Vote rate limiter
export const voteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 votes per minute
    message: {
        success: false,
        message: 'Too many votes, please slow down.',
    },
});
