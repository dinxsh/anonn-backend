import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

/**
 * Post Controller
 * Handles post CRUD, voting, comments, and filtering
 */

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
export const createPost = async (req, res, next) => {
    try {
        const { title, content, community, bowl, companyTags, type, mediaUrl, linkUrl } = req.body;
        const mongoose = (await import('mongoose')).default;

        let communityId = community;
        if (communityId && typeof communityId === 'string') {
            if (mongoose.Types.ObjectId.isValid(communityId)) {
                communityId = new mongoose.Types.ObjectId(communityId);
            } else {
                return errorResponse(res, 400, null, 'Invalid community ID');
            }
        }

        let companyTagIds = Array.isArray(companyTags) ? companyTags : [];
        companyTagIds = companyTagIds.map(tag => {
            if (typeof tag === 'string' && mongoose.Types.ObjectId.isValid(tag)) {
                return new mongoose.Types.ObjectId(tag);
            } else {
                return null;
            }
        });
        if (companyTagIds.includes(null)) {
            return errorResponse(res, 400, null, 'One or more companyTags are invalid IDs');
        }

        const post = await Post.create({
            title,
            content,
            author: req.user._id,
            community: communityId,
            bowl,
            companyTags: companyTagIds,
            type: type || 'text',
            mediaUrl,
            linkUrl,
        });

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'username avatar')
            .populate('community', 'name displayName')
            .populate('companyTags', 'name ticker');

        return successResponse(res, 201, { post: populatedPost }, 'Post created successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/posts
 * @desc    Get posts with filters
 * @access  Public
 */
export const getPosts = async (req, res, next) => {
    try {
        const { sort = 'hot', community, company, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        let query = { isActive: true };

        if (community) {
            query.community = community;
        }

        if (company) {
            query.companyTags = company;
        }

        let sortOption = {};
        if (sort === 'hot') {
            // Hot algorithm: recent + votes
            sortOption = { createdAt: -1 };
        } else if (sort === 'trending') {
            // Trending: sort by vote score
            sortOption = { createdAt: -1 };
        } else if (sort === 'new') {
            sortOption = { createdAt: -1 };
        } else if (sort === 'top') {
            sortOption = { createdAt: -1 };
        }

        const posts = await Post.find(query)
            .sort(sortOption)
            .limit(parseInt(limit))
            .skip(skip)
            .populate('author', 'username avatar')
            .populate('community', 'name displayName avatar')
            .populate('companyTags', 'name ticker logo');

        const total = await Post.countDocuments(query);

        // Calculate scores for client-side sorting if needed
        const postsWithScores = posts.map(post => {
            const postObj = post.toObject();
            postObj.voteScore = post.upvotes.length - post.downvotes.length;
            return postObj;
        });

        return paginatedResponse(res, postsWithScores, parseInt(page), parseInt(limit), total);

    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/posts/:id
 * @desc    Get single post
 * @access  Public
 */
export const getPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username avatar bio')
            .populate('community', 'name displayName avatar')
            .populate('bowl', 'name displayName icon')
            .populate('companyTags', 'name ticker logo');

        if (!post || !post.isActive) {
            return errorResponse(res, 404, 'Post not found');
        }

        // Increment view count
        post.viewCount += 1;
        await post.save();

        const postObj = post.toObject();
        postObj.voteScore = post.upvotes.length - post.downvotes.length;

        return successResponse(res, 200, { post: postObj }, 'Post retrieved');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/posts/:id
 * @desc    Update post
 * @access  Private
 */
export const updatePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return errorResponse(res, 404, 'Post not found');
        }

        // Check authorization
        if (post.author.toString() !== req.user._id.toString()) {
            return errorResponse(res, 403, 'Not authorized to update this post');
        }

        const { title, content } = req.body;

        if (title) post.title = title;
        if (content) post.content = content;

        await post.save();

        return successResponse(res, 200, { post }, 'Post updated successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete post
 * @access  Private
 */
export const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return errorResponse(res, 404, 'Post not found');
        }

        // Check authorization
        if (post.author.toString() !== req.user._id.toString()) {
            return errorResponse(res, 403, 'Not authorized to delete this post');
        }

        // Soft delete
        post.isActive = false;
        await post.save();

        return successResponse(res, 200, {}, 'Post deleted successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/posts/:id/vote
 * @desc    Vote on post
 * @access  Private
 */
export const votePost = async (req, res, next) => {
    try {
        const { voteType } = req.body; // 'upvote' or 'downvote'
        const post = await Post.findById(req.params.id);

        if (!post) {
            return errorResponse(res, 404, 'Post not found');
        }

        const userId = req.user._id;
        const hasUpvoted = post.upvotes.includes(userId);
        const hasDownvoted = post.downvotes.includes(userId);

        if (voteType === 'upvote') {
            if (hasUpvoted) {
                // Remove upvote
                post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
            } else {
                // Add upvote, remove downvote if exists
                post.upvotes.push(userId);
                if (hasDownvoted) {
                    post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());
                }
            }
        } else if (voteType === 'downvote') {
            if (hasDownvoted) {
                // Remove downvote
                post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());
            } else {
                // Add downvote, remove upvote if exists
                post.downvotes.push(userId);
                if (hasUpvoted) {
                    post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
                }
            }
        } else {
            return errorResponse(res, 400, 'Invalid vote type');
        }

        await post.save();

        return successResponse(res, 200, {
            voteScore: post.upvotes.length - post.downvotes.length
        }, 'Vote recorded');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/posts/:id/comments
 * @desc    Add comment to post
 * @access  Private
 */
export const addComment = async (req, res, next) => {
    try {
        const { content, parentComment } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return errorResponse(res, 404, 'Post not found');
        }

        const comment = await Comment.create({
            content,
            author: req.user._id,
            post: req.params.id,
            parentComment: parentComment || null,
        });

        // Increment comment count
        post.commentCount += 1;
        await post.save();

        // If it's a reply, increment parent comment's reply count
        if (parentComment) {
            await Comment.findByIdAndUpdate(parentComment, { $inc: { replyCount: 1 } });
        }

        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'username avatar');

        return successResponse(res, 201, { comment: populatedComment }, 'Comment added');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/posts/:id/comments
 * @desc    Get post comments
 * @access  Public
 */
export const getComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({
            post: req.params.id,
            parentComment: null,
            isActive: true
        })
            .sort({ createdAt: -1 })
            .populate('author', 'username avatar')
            .populate({
                path: 'replies',
                populate: { path: 'author', select: 'username avatar' }
            });

        return successResponse(res, 200, { comments }, 'Comments retrieved');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/posts/:id/share
 * @desc    Increment share count
 * @access  Public
 */
export const sharePost = async (req, res, next) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { shareCount: 1 } },
            { new: true }
        );

        if (!post) {
            return errorResponse(res, 404, 'Post not found');
        }

        return successResponse(res, 200, {}, 'Share count updated');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/posts/search
 * @desc    Search posts
 * @access  Public
 */
export const searchPosts = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        if (!q) {
            return errorResponse(res, 400, 'Search query is required');
        }

        const posts = await Post.find({
            $text: { $search: q },
            isActive: true,
        })
            .limit(parseInt(limit))
            .skip(skip)
            .populate('author', 'username avatar')
            .populate('community', 'name displayName');

        const total = await Post.countDocuments({
            $text: { $search: q },
            isActive: true,
        });

        return paginatedResponse(res, posts, parseInt(page), parseInt(limit), total);

    } catch (error) {
        next(error);
    }
};
