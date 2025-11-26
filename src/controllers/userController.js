import User from '../models/User.js';
import Post from '../models/Post.js';
import Poll from '../models/Poll.js';
import Comment from '../models/Comment.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * User Controller
 * Handles user profile management, follow/unfollow, bookmarks
 */

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile
 * @access  Public
 */
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('joinedCommunities', 'name displayName avatar memberCount')
            .populate('joinedBowls', 'name displayName icon memberCount');

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        // Get counts
        const postCount = await Post.countDocuments({ author: user._id, isActive: true });
        const pollCount = await Poll.countDocuments({ author: user._id, isActive: true });
        const commentCount = await Comment.countDocuments({ author: user._id, isActive: true });

        const userProfile = {
            ...user.toObject(),
            stats: {
                posts: postCount,
                polls: pollCount,
                comments: commentCount,
                followers: user.followers.length,
                following: user.following.length,
                communities: user.joinedCommunities.length,
                bowls: user.joinedBowls.length,
            },
        };

        return successResponse(res, 200, { user: userProfile }, 'User profile retrieved');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
    try {
        // Only allow users to update their own profile
        if (req.user._id.toString() !== req.params.id) {
            return errorResponse(res, 403, 'Not authorized to update this profile');
        }

        const { username, bio, avatar } = req.body;

        const updates = {};
        if (username) updates.username = username;
        if (bio !== undefined) updates.bio = bio;
        if (avatar !== undefined) updates.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        return successResponse(res, 200, { user }, 'Profile updated successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/users/:id/follow
 * @desc    Follow a user
 * @access  Private
 */
export const followUser = async (req, res, next) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return errorResponse(res, 404, 'User not found');
        }

        // Can't follow yourself
        if (req.params.id === req.user._id.toString()) {
            return errorResponse(res, 400, 'You cannot follow yourself');
        }

        // Check if already following
        if (currentUser.following.includes(req.params.id)) {
            return errorResponse(res, 400, 'Already following this user');
        }

        // Add to following and followers
        currentUser.following.push(req.params.id);
        userToFollow.followers.push(req.user._id);

        await currentUser.save();
        await userToFollow.save();

        return successResponse(res, 200, {}, 'User followed successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/users/:id/follow
 * @desc    Unfollow a user
 * @access  Private
 */
export const unfollowUser = async (req, res, next) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToUnfollow) {
            return errorResponse(res, 404, 'User not found');
        }

        // Check if following
        if (!currentUser.following.includes(req.params.id)) {
            return errorResponse(res, 400, 'Not following this user');
        }

        // Remove from following and followers
        currentUser.following = currentUser.following.filter(
            id => id.toString() !== req.params.id
        );
        userToUnfollow.followers = userToUnfollow.followers.filter(
            id => id.toString() !== req.user._id.toString()
        );

        await currentUser.save();
        await userToUnfollow.save();

        return successResponse(res, 200, {}, 'User unfollowed successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/users/bookmarks
 * @desc    Add bookmark
 * @access  Private
 */
export const addBookmark = async (req, res, next) => {
    try {
        const { type, itemId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        // Add to appropriate bookmark array
        switch (type) {
            case 'post':
                if (!user.bookmarkedPosts.includes(itemId)) {
                    user.bookmarkedPosts.push(itemId);
                    await Post.findByIdAndUpdate(itemId, { $inc: { bookmarkCount: 1 } });
                }
                break;
            case 'poll':
                if (!user.bookmarkedPolls.includes(itemId)) {
                    user.bookmarkedPolls.push(itemId);
                    await Poll.findByIdAndUpdate(itemId, { $inc: { bookmarkCount: 1 } });
                }
                break;
            case 'comment':
                if (!user.bookmarkedComments.includes(itemId)) {
                    user.bookmarkedComments.push(itemId);
                }
                break;
            case 'user':
                if (!user.bookmarkedUsers.includes(itemId)) {
                    user.bookmarkedUsers.push(itemId);
                }
                break;
            default:
                return errorResponse(res, 400, 'Invalid bookmark type');
        }

        await user.save();

        return successResponse(res, 200, {}, 'Bookmark added successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/users/bookmarks/:id
 * @desc    Remove bookmark
 * @access  Private
 */
export const removeBookmark = async (req, res, next) => {
    try {
        const { type } = req.query;
        const user = await User.findById(req.user._id);

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        // Remove from appropriate bookmark array
        switch (type) {
            case 'post':
                user.bookmarkedPosts = user.bookmarkedPosts.filter(
                    id => id.toString() !== req.params.id
                );
                await Post.findByIdAndUpdate(req.params.id, { $inc: { bookmarkCount: -1 } });
                break;
            case 'poll':
                user.bookmarkedPolls = user.bookmarkedPolls.filter(
                    id => id.toString() !== req.params.id
                );
                await Poll.findByIdAndUpdate(req.params.id, { $inc: { bookmarkCount: -1 } });
                break;
            case 'comment':
                user.bookmarkedComments = user.bookmarkedComments.filter(
                    id => id.toString() !== req.params.id
                );
                break;
            case 'user':
                user.bookmarkedUsers = user.bookmarkedUsers.filter(
                    id => id.toString() !== req.params.id
                );
                break;
            default:
                return errorResponse(res, 400, 'Invalid bookmark type');
        }

        await user.save();

        return successResponse(res, 200, {}, 'Bookmark removed successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/users/bookmarks
 * @desc    Get all user bookmarks
 * @access  Private
 */
export const getBookmarks = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'bookmarkedPosts',
                populate: { path: 'author', select: 'username avatar' },
            })
            .populate({
                path: 'bookmarkedPolls',
                populate: { path: 'author', select: 'username avatar' },
            })
            .populate({
                path: 'bookmarkedComments',
                populate: { path: 'author', select: 'username avatar' },
            })
            .populate('bookmarkedUsers', 'username avatar bio');

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        const bookmarks = {
            posts: user.bookmarkedPosts,
            polls: user.bookmarkedPolls,
            comments: user.bookmarkedComments,
            users: user.bookmarkedUsers,
        };

        return successResponse(res, 200, { bookmarks }, 'Bookmarks retrieved');

    } catch (error) {
        next(error);
    }
};
