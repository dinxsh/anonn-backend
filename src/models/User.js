import mongoose from 'mongoose';

/**
 * User Model
 * Represents users with profiles, bookmarks, and social features
 */

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters'],
            match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        // Profile information
        avatar: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
            default: '',
        },
        // Web3 wallet addresses
        walletAddresses: [{
            address: String,
            chain: {
                type: String,
                enum: ['ethereum', 'polygon', 'binance', 'solana'],
            },
            isPrimary: {
                type: Boolean,
                default: false,
            },
            verified: {
                type: Boolean,
                default: false,
            },
        }],
        // Social features
        followers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        following: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        // Bookmarks
        bookmarkedPosts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        }],
        bookmarkedPolls: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Poll',
        }],
        bookmarkedComments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        }],
        bookmarkedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        // Communities and Bowls
        joinedCommunities: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community',
        }],
        joinedBowls: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bowl',
        }],
        // Notification settings
        notificationSettings: {
            email: {
                type: Boolean,
                default: true,
            },
            push: {
                type: Boolean,
                default: true,
            },
            comments: {
                type: Boolean,
                default: true,
            },
            follows: {
                type: Boolean,
                default: true,
            },
            mentions: {
                type: Boolean,
                default: true,
            },
        },
        // Device tokens for push notifications
        deviceTokens: [String],
        // Account status
        isActive: {
            type: Boolean,
            default: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for follower count
userSchema.virtual('followerCount').get(function () {
    return this.followers.length;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function () {
    return this.following.length;
});

// Virtual for post count (will be populated by queries)
userSchema.virtual('postCount', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author',
    count: true,
});

// Virtual for poll count
userSchema.virtual('pollCount', {
    ref: 'Poll',
    localField: '_id',
    foreignField: 'author',
    count: true,
});

// Virtual for comment count
userSchema.virtual('commentCount', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'author',
    count: true,
});

const User = mongoose.model('User', userSchema);

export default User;
