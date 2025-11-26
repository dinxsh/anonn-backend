import mongoose from 'mongoose';

/**
 * Post Model
 * Represents posts with votes, comments, and company tags
 */

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Post title is required'],
            trim: true,
            maxlength: [300, 'Title cannot exceed 300 characters'],
        },
        content: {
            type: String,
            required: [true, 'Post content is required'],
            maxlength: [10000, 'Content cannot exceed 10000 characters'],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author is required'],
        },
        // Community and Bowl associations
        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community',
        },
        bowl: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bowl',
        },
        // Company tags
        companyTags: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
        }],
        // Voting
        upvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        downvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        // Engagement metrics
        viewCount: {
            type: Number,
            default: 0,
        },
        shareCount: {
            type: Number,
            default: 0,
        },
        bookmarkCount: {
            type: Number,
            default: 0,
        },
        commentCount: {
            type: Number,
            default: 0,
        },
        // Post type and status
        type: {
            type: String,
            enum: ['text', 'link', 'image', 'video'],
            default: 'text',
        },
        mediaUrl: {
            type: String,
        },
        linkUrl: {
            type: String,
        },
        // Post status
        isActive: {
            type: Boolean,
            default: true,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        isLocked: {
            type: Boolean,
            default: false,
        },
        // Moderation
        removedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        removalReason: String,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ bowl: 1, createdAt: -1 });
postSchema.index({ companyTags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' }); // Text search

// Virtual for vote score
postSchema.virtual('voteScore').get(function () {
    return this.upvotes.length - this.downvotes.length;
});

// Virtual for hot score (simplified algorithm)
postSchema.virtual('hotScore').get(function () {
    const hoursSincePost = (Date.now() - this.createdAt) / (1000 * 60 * 60);
    const score = this.upvotes.length - this.downvotes.length;
    return score / Math.pow(hoursSincePost + 2, 1.5);
});

// Virtual for comments
postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post',
});

const Post = mongoose.model('Post', postSchema);

export default Post;
