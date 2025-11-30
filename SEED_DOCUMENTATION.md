# Database Seed Script - Documentation

## Overview
The seed script populates your MongoDB database with sample data for testing and development.

## What Gets Created

### Users (5)
- **alice_crypto** - Crypto enthusiast (alice@example.com)
- **bob_trader** - Market analyst (bob@example.com)
- **charlie_dev** - Solana developer (charlie@example.com)
- **diana_nft** - NFT collector (diana@example.com)
- **eve_whale** - Whale investor with Solana wallet (eve@example.com)

**Password for all users**: `password123`

### Communities (3)
- **crypto_general** - General cryptocurrency discussion
- **defi** - DeFi protocols and strategies
- **nft_marketplace** - NFT drops and trading

### Bowls (2)
- **solana_ecosystem** - Solana projects and updates
- **market_predictions** - Market predictions and analysis

### Companies (3)
- **Solana Labs** (SOL) - High-performance blockchain
- **Uniswap** (UNI) - Decentralized exchange
- **Chainlink** (LINK) - Oracle network

### Posts (5)
- Solana hits new all-time high
- Best DeFi yields discussion
- NFT collection announcement
- Chainlink integration guide
- Whale alert on Uniswap

### Comments (4)
- Distributed across posts with upvotes

### Polls (2)
- Will ETH reach $10,000 by end of 2024?
- Best blockchain for NFTs?

### Prediction Markets (2)
- Will Bitcoin reach $100,000 in 2024?
- Solana TVL to exceed $10B by Q2 2024?

## Usage

### Run the Seed Script
```bash
npm run seed
```

### Expected Output
```
🌱 Starting database seeding...
🗑️  Clearing existing data...
✅ Existing data cleared

👥 Creating users...
✅ Created 5 users

🏘️  Creating communities...
✅ Created 3 communities

🎯 Creating bowls...
✅ Created 2 bowls

🏢 Creating companies...
✅ Created 3 companies

📝 Creating posts...
✅ Created 5 posts

💬 Creating comments...
✅ Created 4 comments

📊 Creating polls...
✅ Created 2 polls

📈 Creating prediction markets...
✅ Created 2 prediction markets

🔖 Adding bookmarks...
✅ Bookmarks added

═══════════════════════════════════════
🎉 Database seeding completed!

Summary:
  👥 Users: 5
  🏘️  Communities: 3
  🎯 Bowls: 2
  🏢 Companies: 3
  📝 Posts: 5
  💬 Comments: 4
  📊 Polls: 2
  📈 Markets: 2
═══════════════════════════════════════
```

## Test the API

### 1. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

### 2. Get Posts
```bash
curl http://localhost:8000/api/posts
```

### 3. Get Communities
```bash
curl http://localhost:8000/api/communities
```

### 4. Get Companies
```bash
curl http://localhost:8000/api/companies
```

### 5. Get Polls
```bash
curl http://localhost:8000/api/polls
```

## Swagger UI Testing

1. Navigate to: http://localhost:8000/api-docs
2. Click "Authorize" button
3. Login with: `alice@example.com` / `password123`
4. Copy the `accessToken` from response
5. Paste token and click "Authorize"
6. Test any protected endpoint!

## Social Connections

The seed script creates realistic social connections:
- Alice follows Bob, Charlie, and Eve
- Bob follows Alice and Eve
- Users have bookmarked various posts and polls
- Posts have upvotes and comments from different users

## Re-running the Seed

The script clears all existing data before seeding, so you can run it multiple times:
```bash
npm run seed
```

**Warning**: This will delete ALL existing data in your database!

## Customization

Edit `scripts/seed.js` to:
- Add more users
- Create different communities
- Add custom posts and polls
- Modify social connections
- Change company data

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running (see MONGODB_SETUP.md)

### Validation Errors
```
ValidationError: ...
```
**Solution**: Check that all required fields match the model schemas in `src/models/`

### Duplicate Key Errors
```
E11000 duplicate key error
```
**Solution**: The script clears data first, but if it fails midway, manually clear the database or use a fresh database
