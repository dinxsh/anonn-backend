import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import swaggerSpec from './config/swagger.js';
import { validateEnv } from './config/envValidation.js';
import { apiLimiter } from './middleware/rateLimiter.js';

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
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // For Swagger UI
            scriptSrc: ["'self'", "'unsafe-inline'"], // For Swagger UI
            imgSrc: ["'self'", "data:", "https:"], // For Swagger UI and external images
        },
    },
})); // Security headers

// Request sanitization
app.use(mongoSanitize()); // Prevent MongoDB injection

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// API Documentation - Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Web3 Social API Docs',
}));

// Health check route
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Web3 Social + Prediction Platform API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    });
});

// API version info
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Web3 Social + Prediction Platform API',
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
const PORT = process.env.PORT || 5000;

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
