import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Swagger/OpenAPI Configuration
 * Simple, working setup for API documentation
 */

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Anonn Backend API',
            version: '1.0.0',
            description: 'Web3 Social + Prediction Market Platform API',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:8000',
                description: 'Development server',
            },
            {
                url: 'https://your-production-url.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                        },
                        data: {
                            type: 'object',
                        },
                    },
                },
            },
        },
        tags: [
            { name: 'System', description: 'System health and info endpoints' },
            { name: 'Authentication', description: 'User authentication and authorization' },
            { name: 'Users', description: 'User profile and social features' },
            { name: 'Posts', description: 'Post creation and management' },
            { name: 'Polls', description: 'Poll creation and voting' },
            { name: 'Communities', description: 'Community management' },
            { name: 'Bowls', description: 'Bowl (category) management' },
            { name: 'Companies', description: 'Company tracking and markets' },
            { name: 'Feed', description: 'Content feed endpoints' },
            { name: 'Notifications', description: 'User notifications' },
            { name: 'Wallet', description: 'Web3 wallet integration' },
        ],
    },
    apis: ['./src/routes/*.js', './src/server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

// Swagger UI options
const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Anonn API Docs',
};

export { swaggerSpec, swaggerUi, swaggerUiOptions };
