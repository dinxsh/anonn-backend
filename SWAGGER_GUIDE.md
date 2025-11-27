# Swagger API Documentation - Quick Reference

## Accessing Swagger UI

**Local Development**: http://localhost:8000/api-docs  
**Production**: https://your-domain.com/api-docs

## Features

✅ **Interactive Testing** - Test all endpoints directly from the browser  
✅ **Authentication Support** - Built-in JWT token authorization  
✅ **Request/Response Examples** - See example payloads for all endpoints  
✅ **Schema Validation** - View data models and validation rules  
✅ **Try It Out** - Execute real API calls and see responses  

---

## How to Use Swagger UI

### 1. **Authorize Your Session**

For endpoints that require authentication:

1. Click the **"Authorize"** button (🔒 icon) at the top right
2. Enter your JWT token in the format: `Bearer <your_token>`
3. Click **"Authorize"**
4. Click **"Close"**

Now all protected endpoints will include your token automatically!

### 2. **Getting a Token**

**Option A: Email/Password Login**
1. Expand `POST /api/auth/login`
2. Click **"Try it out"**
3. Enter your credentials:
   ```json
   {
     "email": "alice@example.com",
     "password": "password123"
   }
   ```
4. Click **"Execute"**
5. Copy the `accessToken` from the response
6. Use it in the Authorize dialog

**Option B: Wallet Authentication**
1. Expand `POST /api/auth/wallet/nonce`
2. Get a nonce with your wallet public key
3. Sign the message with your wallet (Phantom, Solflare, etc.)
4. Expand `POST /api/auth/wallet/verify`
5. Submit your signature
6. Copy the `accessToken` from the response

### 3. **Testing Endpoints**

1. Find the endpoint you want to test
2. Click to expand it
3. Click **"Try it out"**
4. Fill in required parameters and request body
5. Click **"Execute"**
6. View the response below

---

## Endpoint Categories

### 🔐 Authentication
- User registration and login
- Wallet authentication (Solana, Ethereum, etc.)
- Token refresh
- Session management

### 👤 Users
- Profile management
- Follow/unfollow users
- Bookmarks
- User discovery

### 📝 Posts
- Create, read, update, delete posts
- Voting (upvote/downvote)
- Comments
- Search

### 📊 Polls
- Create polls with 2-4 options
- Vote on polls
- View results
- Poll management

### 🏘️ Communities
- Create and manage communities
- Join/leave communities
- Community posts
- Moderation

### 🎯 Bowls
- Create specialized bowls
- Join/leave bowls
- Bowl discovery

### 🏢 Companies
- Company profiles
- Sentiment tracking (bullish/bearish)
- Prediction markets
- Trading

### 🔔 Notifications
- Real-time notifications
- Push notification settings
- Device token management
- Read/unread status

### 📰 Feed
- Recommended feed
- Following feed
- Personalized "For You" feed

### 💼 Wallet
- Multi-chain wallet support
- Link/unlink wallets
- Balance checking
- Signature verification

---

## Common Request Examples

### Create a Post
```json
{
  "title": "My First Post",
  "content": "Hello, Web3 world!",
  "community": "crypto_general",
  "tags": ["introduction", "web3"]
}
```

### Vote on a Post
```json
{
  "voteType": "upvote"
}
```

### Create a Poll
```json
{
  "question": "Will ETH reach $5000 by end of 2024?",
  "options": [
    { "text": "Yes" },
    { "text": "No" },
    { "text": "Maybe" }
  ],
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### Add Bookmark
```json
{
  "type": "post",
  "itemId": "507f1f77bcf86cd799439011"
}
```

### Update Profile
```json
{
  "username": "new_username",
  "bio": "Updated bio",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Server Error |

---

## Tips & Tricks

### 💡 **Use the "Authorize" Feature**
Instead of manually adding `Authorization` headers to each request, use the global Authorize button. It will automatically include your token in all protected endpoints.

### 💡 **Check Response Schemas**
Click on the response schema to see the exact structure of the data you'll receive. This helps with frontend integration.

### 💡 **Copy cURL Commands**
After executing a request, you can copy the cURL command to use in your terminal or scripts.

### 💡 **Test Error Cases**
Try sending invalid data to see how the API handles errors. This helps you build better error handling in your frontend.

### 💡 **Rate Limiting**
Be aware of rate limits:
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes
- Content creation: 10 posts per hour
- Voting: 30 votes per minute

---

## Wallet Integration Testing

### Testing Solana Wallet Auth

1. **Get Nonce**
   ```http
   POST /api/auth/wallet/nonce
   {
     "publicKey": "7xKzL3vQr8mN9pXqB2wY5tH6jK4sL1mR"
   }
   ```

2. **Sign Message** (use your wallet - Phantom, Solflare, etc.)
   - The response includes a `message` field
   - Sign this message with your wallet
   - Get the base58-encoded signature

3. **Verify Signature**
   ```http
   POST /api/auth/wallet/verify
   {
     "publicKey": "7xKzL3vQr8mN9pXqB2wY5tH6jK4sL1mR",
     "signature": "3Bv7wX...zY2",
     "username": "my_username"
   }
   ```

4. **Use Access Token**
   - Copy the `accessToken` from the response
   - Click "Authorize" and paste it
   - Now you can test all protected endpoints!

---

## Schemas Reference

### User Schema
```json
{
  "_id": "string",
  "username": "string",
  "email": "string (optional for wallet-only accounts)",
  "bio": "string",
  "avatar": "string (URL)",
  "authMethod": "email | wallet | both",
  "primaryWallet": "string (Solana address)",
  "walletAddresses": [
    {
      "address": "string",
      "chain": "ethereum | polygon | binance | solana",
      "isPrimary": "boolean",
      "verified": "boolean"
    }
  ],
  "followerCount": "integer",
  "followingCount": "integer",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

### Wallet Schema
```json
{
  "_id": "string",
  "user": "string (User ID)",
  "address": "string (lowercase)",
  "chain": "ethereum | polygon | binance | solana | arbitrum | optimism",
  "isVerified": "boolean",
  "isPrimary": "boolean",
  "isActive": "boolean",
  "nativeBalance": {
    "amount": "string",
    "lastUpdated": "date-time"
  },
  "createdAt": "date-time"
}
```

---

## Troubleshooting

### ❌ "Unauthorized" Error
- Make sure you've clicked "Authorize" and entered a valid token
- Check if your token has expired (tokens expire after 1 hour)
- Use `/api/auth/refresh` to get a new access token

### ❌ "Validation Error"
- Check the request body matches the required schema
- Ensure all required fields are included
- Verify data types (string, integer, boolean, etc.)

### ❌ "Too Many Requests"
- You've hit the rate limit
- Wait for the time window to reset
- Reduce the frequency of your requests

### ❌ "Not Found"
- Check the resource ID is correct
- Ensure the resource exists in the database
- Verify you're using the correct endpoint

---

## Security Notes

🔒 **Never share your access tokens**  
🔒 **Tokens expire after 1 hour** - use refresh tokens to get new ones  
🔒 **Wallet signatures are one-time use** - request a new nonce for each auth attempt  
🔒 **Rate limiting protects the API** - respect the limits  

---

## Support

- **Full Documentation**: See `API_DOCUMENTATION.md`
- **README**: See `README.md` for setup instructions
- **Issues**: Check error messages in API responses

---

**Happy Testing! 🚀**
