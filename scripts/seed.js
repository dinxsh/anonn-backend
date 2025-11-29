import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../src/config/database.js';
import User from '../src/models/User.js';
import Post from '../src/models/Post.js';
import Poll from '../src/models/Poll.js';
import Community from '../src/models/Community.js';
import Bowl from '../src/models/Bowl.js';
import Company from '../src/models/Company.js';
import Market from '../src/models/Market.js';
import Comment from '../src/models/Comment.js';

/**
 * Database Seed Script
 * Populates database with example data for testing
 */

dotenv.config();

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Connect to database
        await connectDB();

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Post.deleteMany({});
        await Poll.deleteMany({});
        await Community.deleteMany({});
        await Bowl.deleteMany({});
        await Company.deleteMany({});
        await Market.deleteMany({});
        await Comment.deleteMany({});
        console.log('✅ Existing data cleared\n');

        // Create users
        console.log('👥 Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = await User.create([
            {
                username: 'alice_trader',
                email: 'alice@example.com',
                password: hashedPassword,
                bio: 'Crypto enthusiast and market analyst',
                avatar: 'https://i.pravatar.cc/150?img=1',
            },
            {
                username: 'bob_investor',
                email: 'bob@example.com',
                password: hashedPassword,
                bio: 'Long-term investor focusing on Web3',
                avatar: 'https://i.pravatar.cc/150?img=2',
            },
            {
                username: 'charlie_dev',
                email: 'charlie@example.com',
                password: hashedPassword,
                bio: 'Full-stack developer and DeFi builder',
                avatar: 'https://i.pravatar.cc/150?img=3',
            },
            {
                username: 'diana_analyst',
                email: 'diana@example.com',
                password: hashedPassword,
                bio: 'Data scientist specializing in prediction markets',
                avatar: 'https://i.pravatar.cc/150?img=4',
            },
            {
                username: 'eve_moderator',
                email: 'eve@example.com',
                password: hashedPassword,
                bio: 'Community moderator and Web3 advocate',
                avatar: 'https://i.pravatar.cc/150?img=5',
            },
        ]);
        console.log(`✅ Created ${users.length} users\n`);

        // Create communities
        console.log('🏘️  Creating communities...');
        const communities = await Community.create([
            {
                name: 'web3_predictions',
                displayName: 'Web3 Predictions',
                description: 'Predict the future of Web3 and crypto markets',
                creator: users[0]._id,
                avatar: 'https://picsum.photos/200?random=1',
                banner: 'https://picsum.photos/800/200?random=1',
            },
            {
                name: 'defi_trading',
                displayName: 'DeFi Trading',
                description: 'Discussion and predictions about DeFi protocols',
                creator: users[1]._id,
                avatar: 'https://picsum.photos/200?random=2',
                banner: 'https://picsum.photos/800/200?random=2',
            },
            {
                name: 'nft_markets',
                displayName: 'NFT Markets',
                description: 'NFT market predictions and analysis',
                creator: users[2]._id,
                avatar: 'https://picsum.photos/200?random=3',
                banner: 'https://picsum.photos/800/200?random=3',
            },
        ]);
        console.log(`✅ Created ${communities.length} communities\n`);

        // Create bowls
        console.log('🥣 Creating bowls...');
        const bowls = await Bowl.create([
            {
                name: 'crypto_markets',
                displayName: 'Crypto Markets',
                description: 'All things cryptocurrency trading and markets',
                creator: users[0]._id,
                category: 'crypto',
                icon: 'https://picsum.photos/100?random=10',
            },
            {
                name: 'technology_trends',
                displayName: 'Technology Trends',
                description: 'Emerging technology trends and predictions',
                creator: users[2]._id,
                category: 'technology',
                icon: 'https://picsum.photos/100?random=11',
            },
        ]);
        console.log(`✅ Created ${bowls.length} bowls\n`);

        // Create companies
        console.log('🏢 Creating companies...');
        const companies = await Company.create([
            {
                name: 'Ethereum',
                ticker: 'ETH',
                description: 'Decentralized platform for smart contracts and dApps',
                logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
                sector: 'crypto',
                website: 'https://ethereum.org',
            },
            {
                name: 'Uniswap',
                ticker: 'UNI',
                description: 'Leading decentralized exchange protocol',
                logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
                sector: 'crypto',
                website: 'https://uniswap.org',
            },
            {
                name: 'Polygon',
                ticker: 'MATIC',
                description: 'Ethereum scaling and infrastructure development',
                logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
                sector: 'crypto',
                website: 'https://polygon.technology',
            },
            {
                name: 'Chainlink',
                ticker: 'LINK',
                description: 'Decentralized oracle network',
                logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
                sector: 'crypto',
                website: 'https://chain.link',
            },
        ]);
        console.log(`✅ Created ${companies.length} companies\n`);

        // Create posts
        console.log('📝 Creating posts...');
        const posts = await Post.create([
            {
                title: 'Ethereum 2.0 Staking Guide for Beginners',
                content: 'A comprehensive guide to staking on Ethereum 2.0. Here are the key things you need to know...',
                author: users[0]._id,
                community: communities[0]._id,
                companyTags: [companies[0]._id],
                upvotes: [users[1]._id, users[2]._id, users[3]._id],
                type: 'text',
            },
            {
                title: 'Uniswap V4 Release: What to Expect',
                content: 'Exploring the upcoming features in Uniswap V4 and their potential impact on DeFi...',
                author: users[1]._id,
                community: communities[1]._id,
                companyTags: [companies[1]._id],
                upvotes: [users[0]._id, users[3]._id],
                type: 'text',
            },
            {
                title: 'NFT Market Analysis Q4 2024',
                content: 'Deep dive into NFT market trends and predictions for Q4 2024...',
                author: users[2]._id,
                community: communities[2]._id,
                upvotes: [users[0]._id, users[1]._id, users[4]._id],
                type: 'text',
            },
            {
                title: 'How to Evaluate DeFi Protocols',
                content: 'Key metrics and indicators for evaluating DeFi protocols before investing...',
                author: users[3]._id,
                community: communities[1]._id,
                upvotes: [users[0]._id, users[2]._id],
                viewCount: 150,
                type: 'text',
            },
        ]);
        console.log(`✅ Created ${posts.length} posts\n`);

        // Create polls
        console.log('📊 Creating polls...');
        const polls = await Poll.create([
            {
                question: 'Will Ethereum reach $8000 by end of 2024?',
                description: 'Prediction market for ETH price target',
                author: users[0]._id,
                community: communities[0]._id,
                company: companies[0]._id,
                options: [
                    { text: 'Yes, it will reach $8000', voteCount: 45, votes: [] },
                    { text: 'No, it will stay below $8000', voteCount: 30, votes: [] },
                    { text: 'It will exceed $6000', voteCount: 15, votes: [] },
                ],
                bias: 'positive',
                expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
            },
            {
                question: 'Which L2 will have the highest TVL in 2025?',
                description: 'Predict the leading Layer 2 solution by Total Value Locked',
                author: users[1]._id,
                community: communities[0]._id,
                company: companies[2]._id,
                options: [
                    { text: 'Polygon', voteCount: 50, votes: [] },
                    { text: 'Arbitrum', voteCount: 35, votes: [] },
                    { text: 'Optimism', voteCount: 25, votes: [] },
                    { text: 'Other', voteCount: 10, votes: [] },
                ],
                bias: 'neutral',
                expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
            },
            {
                question: 'Will Uniswap V4 launch in Q1 2025?',
                description: 'Predict the launch timeline for Uniswap V4',
                author: users[2]._id,
                community: communities[1]._id,
                company: companies[1]._id,
                options: [
                    { text: 'Yes, Q1 2025', voteCount: 40, votes: [] },
                    { text: 'No, Q2 2025 or later', voteCount: 60, votes: [] },
                ],
                bias: 'neutral',
                expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
            },
        ]);
        console.log(`✅ Created ${polls.length} polls\n`);

        // Create markets
        console.log('💹 Creating markets...');
        const markets = await Market.create([
            {
                company: companies[0]._id,
                creator: users[0]._id,
                question: 'Will ETH gas fees average below 10 gwei by Q2 2025?',
                description: 'Market for predicting Ethereum gas fee trends',
                type: 'binary',
                options: [
                    { label: 'Yes', totalShares: 100 },
                    { label: 'No', totalShares: 100 },
                ],
                yesPrice: 0.55,
                noPrice: 0.45,
                totalLiquidity: 10000,
                totalVolume: 2500,
                expiresAt: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
            },
            {
                company: companies[1]._id,
                creator: users[1]._id,
                question: 'Will Uniswap TVL exceed $10B in 2025?',
                description: 'Prediction market for Uniswap Total Value Locked',
                type: 'binary',
                options: [
                    { label: 'Yes', totalShares: 150 },
                    { label: 'No', totalShares: 100 },
                ],
                yesPrice: 0.6,
                noPrice: 0.4,
                totalLiquidity: 18000,
                totalVolume: 3000,
                expiresAt: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
            },
        ]);
        console.log(`✅ Created ${markets.length} markets\n`);

        // Create comments
        console.log('💬 Creating comments...');
        const comments = await Comment.create([
            {
                content: 'Great analysis! I agree with your points about staking rewards.',
                author: users[1]._id,
                post: posts[0]._id,
                upvotes: [users[0]._id, users[2]._id],
            },
            {
                content: 'Thanks for sharing this guide. Very helpful for beginners!',
                author: users[2]._id,
                post: posts[0]._id,
                upvotes: [users[0]._id],
            },
            {
                content: 'Interesting perspective on Uniswap V4. Looking forward to the hooks feature!',
                author: users[3]._id,
                post: posts[1]._id,
                upvotes: [users[1]._id, users[4]._id],
            },
        ]);
        console.log(`✅ Created ${comments.length} comments\n`);

        // Summary
        console.log('📊 Seeding Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Communities: ${communities.length}`);
        console.log(`   Bowls: ${bowls.length}`);
        console.log(`   Companies: ${companies.length}`);
        console.log(`   Posts: ${posts.length}`);
        console.log(`   Polls: ${polls.length}`);
        console.log(`   Markets: ${markets.length}`);
        console.log(`   Comments: ${comments.length}`);
        console.log('\n✅ Database seeding completed successfully!\n');
        console.log('🔐 Test user credentials:');
        console.log('   Email: alice@example.com');
        console.log('   Password: password123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
