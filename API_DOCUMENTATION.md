# API Documentation Summary

## Overview

This document provides a comprehensive overview of all API endpoints available in the Anonn Backend API. All endpoints return JSON responses in a standardized format.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.example.com`

## Interactive Documentation

Visit `/api-docs` for interactive Swagger UI documentation where you can test all endpoints.

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Getting an Access Token

**Option 1: Email/Password Authentication**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Option 2: Solana Wallet Authentication**
```http
# Step 1: Request nonce
POST /api/auth/wallet/nonce
Content-Type: application/json

{
  "publicKey": "7xKzL3vQr8mN9pXqB2wY5tH6jK4sL1mR"
}

# Step 2: Sign the message with your wallet, then verify
POST /api/auth/wallet/verify
Content-Type: application/json

{
  "publicKey": "7xKzL3vQr8mN9pXqB2wY5tH6jK4sL1mR",
  "signature": "3Bv7wX...zY2",
  "username": "my_username" // optional for new users
}
```

---

## API Endpoints

### 🔐 Authentication

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register new user with email/password |
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/logout` | Yes | Logout current user |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/auth/me` | Yes | Get current user profile |
| POST | `/api/auth/wallet/nonce` | No | Request nonce for wallet auth |
| POST | `/api/auth/wallet/verify` | No | Verify wallet signature and login/register |
| POST | `/api/auth/wallet/link` | Yes | Link wallet to existing account |

### 👤 Users

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/users/:id` | No | Get user profile by ID or username |
| PUT | `/api/users/:id` | Yes | Update own profile |
| POST | `/api/users/:id/follow` | Yes | Follow a user |
| DELETE | `/api/users/:id/follow` | Yes | Unfollow a user |
| POST | `/api/users/bookmarks` | Yes | Add bookmark (post/poll/comment/user) |
| GET | `/api/users/bookmarks` | Yes | Get all bookmarks |
| DELETE | `/api/users/bookmarks/:id` | Yes | Remove bookmark |

### 📝 Posts

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/posts` | Yes | Create new post |
| GET | `/api/posts` | No | Get all posts (with filters) |
| GET | `/api/posts/:id` | No | Get single post by ID |
| PUT | `/api/posts/:id` | Yes | Update own post |
| DELETE | `/api/posts/:id` | Yes | Delete own post |
| POST | `/api/posts/:id/vote` | Yes | Vote on post (upvote/downvote) |
| POST | `/api/posts/:id/comments` | Yes | Add comment to post |
| GET | `/api/posts/:id/comments` | No | Get post comments |
| GET | `/api/posts/search` | No | Search posts by query |

### 📊 Polls

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/polls` | Yes | Create new poll (2-4 options) |
| GET | `/api/polls` | No | Get all polls |
| GET | `/api/polls/:id` | No | Get poll with results |
| POST | `/api/polls/:id/vote` | Yes | Vote on poll option |
| DELETE | `/api/polls/:id` | Yes | Delete own poll |
| GET | `/api/polls/:id/results` | No | Get poll results |

### 🏘️ Communities

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/communities` | Yes | Create new community |
| GET | `/api/communities` | No | Get all communities |
| GET | `/api/communities/:id` | No | Get community by ID or name |
| PUT | `/api/communities/:id` | Yes | Update community (moderator only) |
| POST | `/api/communities/:id/join` | Yes | Join community |
| DELETE | `/api/communities/:id/leave` | Yes | Leave community |
| GET | `/api/communities/:id/posts` | No | Get community posts |

### 🎯 Bowls

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/bowls` | Yes | Create new bowl |
| GET | `/api/bowls` | No | Get all bowls |
| GET | `/api/bowls/:id` | No | Get bowl by ID or name |
| POST | `/api/bowls/:id/join` | Yes | Join bowl |
| DELETE | `/api/bowls/:id/leave` | Yes | Leave bowl |

### 🏢 Companies

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/companies` | Yes | Create company profile |
| GET | `/api/companies` | No | Get all companies |
| GET | `/api/companies/:id` | No | Get company by ID or ticker |
| POST | `/api/companies/:id/sentiment` | Yes | Add sentiment (bullish/bearish) |
| GET | `/api/companies/:id/posts` | No | Get company-related posts |
| POST | `/api/companies/:id/markets` | Yes | Create prediction market |
| POST | `/api/companies/:id/markets/:marketId/trade` | Yes | Trade on market |
| GET | `/api/companies/:id/markets/:marketId` | No | Get market details |

### 🔔 Notifications

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/notifications` | Yes | Get user notifications |
| PUT | `/api/notifications/:id/read` | Yes | Mark notification as read |
| PUT | `/api/notifications/read-all` | Yes | Mark all as read |
| POST | `/api/notifications/device-token` | Yes | Register device for push notifications |
| PUT | `/api/notifications/settings` | Yes | Update notification settings |
| DELETE | `/api/notifications/:id` | Yes | Delete notification |

### 📰 Feed

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/feed/recommended` | No | Get recommended feed (trending) |
| GET | `/api/feed/following` | Yes | Get feed from followed users |
| GET | `/api/feed/for-you` | Yes | Get personalized feed |

### 💼 Wallet

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/wallet/link` | Yes | Link new wallet (multi-chain) |
| DELETE | `/api/wallet/:id/unlink` | Yes | Unlink wallet |
| GET | `/api/wallet` | Yes | Get all linked wallets |
| GET | `/api/wallet/:id/balance` | Yes | Get wallet balance |
| POST | `/api/wallet/verify` | No | Verify wallet signature |

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## Common Query Parameters

### Pagination
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page

### Filtering
- `community` (string) - Filter by community ID/name
- `author` (string) - Filter by author ID
- `sort` (string) - Sort by: `recent`, `popular`, `trending`

### Search
- `q` (string) - Search query

---

## Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 5 attempts | 15 minutes |
| Wallet Auth | 5 attempts | 15 minutes |
| Content Creation | 10 posts | 1 hour |
| Voting | 30 votes | 1 minute |

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## Wallet Integration

### Supported Wallets

✅ **Solana Wallets**
- Phantom
- Solflare
- Backpack
- Coinbase Wallet
- Trust Wallet
- Glow
- Slope
- And any wallet supporting Ed25519 signatures

✅ **EVM Wallets** (Ethereum, Polygon, BSC, Arbitrum, Optimism)
- MetaMask
- WalletConnect
- Coinbase Wallet
- Trust Wallet

### Wallet Authentication Flow

1. **Request Nonce**: `POST /api/auth/wallet/nonce`
   - Provide your wallet's public key
   - Receive a unique nonce and message to sign

2. **Sign Message**: Use your wallet to sign the message
   - The signature proves you own the private key
   - No gas fees or blockchain transaction required

3. **Verify Signature**: `POST /api/auth/wallet/verify`
   - Send the signature back to the server
   - Receive access token and user data
   - New users are automatically registered

### Linking Wallet to Existing Account

If you already have an email/password account:

1. Login with email/password
2. Request nonce: `POST /api/auth/wallet/nonce`
3. Sign the message with your wallet
4. Link wallet: `POST /api/auth/wallet/link` (with Bearer token)

---

## Examples

### Create a Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My First Post",
  "content": "Hello, Web3 world!",
  "community": "crypto_general",
  "tags": ["introduction", "web3"]
}
```

### Vote on a Poll
```http
POST /api/polls/507f1f77bcf86cd799439011/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "optionIndex": 0
}
```

### Add Bookmark
```http
POST /api/users/bookmarks
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "post",
  "itemId": "507f1f77bcf86cd799439011"
}
```

---

## Testing

### Using Swagger UI

1. Navigate to `/api-docs` in your browser
2. Click "Authorize" button
3. Enter your access token
4. Try out any endpoint directly from the UI

### Using cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'

# Get user profile (with token)
curl -X GET http://localhost:8000/api/users/alice_trader \
  -H "Authorization: Bearer <your_token>"
```

### Using Postman

1. Import the API collection from Swagger UI
2. Set up environment variables for base URL and token
3. Test all endpoints with pre-configured requests

---

## Support

For issues or questions:
- Check `/api-docs` for detailed endpoint documentation
- Review error messages in responses
- Ensure proper authentication headers are included
- Verify rate limits haven't been exceeded

---

**Last Updated**: 2025-11-27
**API Version**: 1.0.0
