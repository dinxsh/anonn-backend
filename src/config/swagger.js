import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger Configuration
 * OpenAPI 3.0 specification for API documentation
 */

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Anonn Backend API',
            version: '1.0.0',
            description: 'Comprehensive REST API for a Web3-enabled social and prediction platform combining features from Reddit and Polymarket',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://api.example.com')
                    : 'http://localhost:8000',
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT access token. Get it from /api/auth/login or /api/auth/wallet/verify',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        username: { type: 'string', example: 'alice_trader' },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'alice@example.com',
                            description: 'Email address (optional for wallet-only accounts)'
                        },
                        bio: { type: 'string', example: 'Crypto enthusiast and market analyst' },
                        avatar: { type: 'string', format: 'uri', example: 'https://i.pravatar.cc/150?img=1' },
                        authMethod: {
                            type: 'string',
                            enum: ['email', 'wallet', 'both'],
                            example: 'both',
                            description: 'Authentication method used by the user'
                        },
                        primaryWallet: {
                            type: 'string',
                            example: '7xKzL3vQr8mN9pXqB2wY5tH6jK4sL1mR',
                            description: 'Primary Solana wallet address'
                        },
                        walletAddresses: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    address: { type: 'string' },
                                    chain: {
                                        type: 'string',
                                        enum: ['ethereum', 'polygon', 'binance', 'solana']
                                    },
                                    isPrimary: { type: 'boolean' },
                                    verified: { type: 'boolean' }
                                }
                            }
                        },
                        followerCount: { type: 'integer', example: 42 },
                        followingCount: { type: 'integer', example: 38 },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Wallet: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        user: { type: 'string', description: 'User ID' },
                        address: {
                            type: 'string',
                            example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                            description: 'Wallet address (lowercase)'
                        },
                        chain: {
                            type: 'string',
                            enum: ['ethereum', 'polygon', 'binance', 'solana', 'arbitrum', 'optimism'],
                            example: 'solana'
                        },
                        isVerified: { type: 'boolean', example: true },
                        isPrimary: { type: 'boolean', example: false },
                        isActive: { type: 'boolean', example: true },
                        nativeBalance: {
                            type: 'object',
                            properties: {
                                amount: { type: 'string', example: '1.234567' },
                                lastUpdated: { type: 'string', format: 'date-time' }
                            }
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Post: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string', example: 'Ethereum 2.0 Staking Guide' },
                        content: { type: 'string' },
                        author: { $ref: '#/components/schemas/User' },
                        community: { type: 'string' },
                        voteScore: { type: 'integer', example: 42 },
                        commentCount: { type: 'integer', example: 15 },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Poll: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        question: { type: 'string', example: 'Will ETH reach $8000 by end of 2024?' },
                        options: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    text: { type: 'string' },
                                    voteCount: { type: 'integer' },
                                },
                            },
                        },
                        totalVotes: { type: 'integer', example: 150 },
                        expiresAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: { type: 'string' },
                                    message: { type: 'string' }
                                }
                            }
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation successful' },
                        data: { type: 'object' },
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
                ValidationError: {
                    description: 'Validation failed',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
            },
        },
        tags: [
            { name: 'Authentication', description: 'User authentication and authorization' },
            { name: 'Users', description: 'User profile management' },
            { name: 'Posts', description: 'Post creation and interaction' },
            { name: 'Polls', description: 'Poll creation and voting' },
            { name: 'Communities', description: 'Community management' },
            { name: 'Bowls', description: 'Bowl management' },
            { name: 'Companies', description: 'Company tracking and markets' },
            { name: 'Notifications', description: 'User notifications' },
            { name: 'Feed', description: 'Content feeds' },
            { name: 'Wallet', description: 'Web3 wallet integration' },
        ],
    },
    apis: ['./src/routes/*.js'], // Path to API routes for annotations
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
