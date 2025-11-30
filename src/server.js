import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import { swaggerSpec, swaggerUi, swaggerUiOptions } from './config/swagger.js';
import { validateEnv } from './config/envValidation.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import {
    requestId,
    checkRequestSize,
    sanitizeData,
    xssProtection,
    preventParamPollution,
    securityHeaders
} from './middleware/security.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import pollRoutes from './routes/polls.js';
import communityRoutes from './routes/communities.js';
import bowlRoutes from './routes/bowls.js';
import companyRoutes from './routes/companies.js';
import notificationRoutes from './routes/notifications.js';
import feedRoutes from './routes/feed.js';
import walletRoutes from './routes/wallet.js';

// Load environment variables
dotenv.config();

// Validate environment variables
try {
    validateEnv();
    console.log('✅ Environment variables validated');
} catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    process.exit(1);
}

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Security Middleware
app.use(requestId);
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use(securityHeaders);
app.use(checkRequestSize);
app.use(sanitizeData);
app.use(xssProtection);
app.use(preventParamPollution);

// Request sanitization (redundant with sanitizeData but keeping for safety if sanitizeData changes)
// app.use(mongoSanitize()); 

// CORS - Enhanced configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, curl, etc.)
        if (!origin) return callback(null, true);

        // Parse allowed origins from environment variable (comma-separated)
        const allowedOrigins = process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
            : ['http://localhost:3000'];

        // Check if the origin is in the allowed list or if wildcard is set
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Still allow but log warning - prevents blocking legitimate requests during development
            console.warn(`⚠️  CORS: Request from non-whitelisted origin: ${origin}`);
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // Cache preflight for 24 hours
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Explicit preflight handling for all routes
app.options('*', cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



import { readFileSync } from 'fs';
import path from 'path';

if (process.env.VERCEL === '1') {
    // On Vercel, serve static swagger.html at /api-docs
    app.get('/api-docs', (req, res) => {
        const swaggerHtmlPath = path.join(process.cwd(), 'src', 'public', 'swagger.html');
        let html = readFileSync(swaggerHtmlPath, 'utf8');
        // Optionally inject the OpenAPI spec URL dynamically
        html = html.replace('"/openapi.json"', '"/api-docs/openapi.json"');
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    });
    // Serve the OpenAPI spec as JSON for Swagger UI
    app.get('/api-docs/openapi.json', (req, res) => {
        res.json(swaggerSpec);
    });
} else {
    // Local/dev: use swagger-ui-express middleware
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
}

// API version info
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Anonn Backend API',
        version: '1.0.0',
        documentation: '/api-docs',
        health: '/health',
    });
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/bowls', bowlRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/wallet', walletRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
    });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server (only in non-serverless environments)
const PORT = process.env.PORT || 8000;

// For Vercel serverless, don't start the server
if (process.env.VERCEL !== '1') {
    const server = app.listen(PORT, () => {
        console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}`);
        console.log(`📚 API Documentation at http://localhost:${PORT}/api-docs`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });
    });
}

// Export for Vercel serverless
export default app;
