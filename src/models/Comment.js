import mongoose from 'mongoose';

/**
 * Comment Model
 * Represents comments and replies on posts and polls
 */

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, 'Comment content is required'],
            trim: true,
            maxlength: [2000, 'Comment cannot exceed 2000 characters'],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author is required'],
        },
        // Reference to post or poll
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
        poll: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Poll',
        },
        // For nested replies
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
        // Voting
        upvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        downvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        // Reply count
        replyCount: {
            type: Number,
            default: 0,
        },
        // Comment status
        isActive: {
            type: Boolean,
            default: true,
        },
        isEdited: {
            type: Boolean,
            default: false,
        },
        editedAt: Date,
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

// Indexes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ poll: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

// Virtual for vote score
commentSchema.virtual('voteScore').get(function () {
    return this.upvotes.length - this.downvotes.length;
});

// Virtual for replies
commentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentComment',
});

// Validation: must have either post or poll reference
commentSchema.pre('validate', function (next) {
    if (!this.post && !this.poll && !this.parentComment) {
        next(new Error('Comment must be associated with a post, poll, or parent comment'));
    } else {
        next();
    }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
