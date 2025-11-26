import Bowl from '../models/Bowl.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Bowl Controller
 * Similar to communities but for different categorization (like cross-community topics)
 */

export const createBowl = async (req, res, next) => {
    try {
        const { name, displayName, description, icon, banner, category } = req.body;

        const bowl = await Bowl.create({
            name,
            displayName,
            description,
            icon,
            banner,
            category,
            creator: req.user._id,
        });

        return successResponse(res, 201, { bowl }, 'Bowl created');
    } catch (error) {
        next(error);
    }
};

export const getBowls = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, category } = req.query;
        const skip = (page - 1) * limit;

        let query = { isActive: true };
        if (category) query.category = category;

        const bowls = await Bowl.find(query)
            .sort({ memberCount: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .populate('creator', 'username avatar');

        const total = await Bowl.countDocuments(query);

        return successResponse(res, 200, { bowls, total }, 'Bowls retrieved');
    } catch (error) {
        next(error);
    }
};

export const getBowl = async (req, res, next) => {
    try {
        const bowl = await Bowl.findById(req.params.id)
            .populate('creator', 'username avatar')
            .populate('moderators', 'username avatar')
            .populate('communities', 'name displayName avatar');

        if (!bowl) {
            return errorResponse(res, 404, 'Bowl not found');
        }

        return successResponse(res, 200, { bowl }, 'Bowl retrieved');
    } catch (error) {
        next(error);
    }
};

export const joinBowl = async (req, res, next) => {
    try {
        const bowl = await Bowl.findById(req.params.id);

        if (!bowl) {
            return errorResponse(res, 404, 'Bowl not found');
        }

        if (bowl.members.includes(req.user._id)) {
            return errorResponse(res, 400, 'Already a member');
        }

        bowl.members.push(req.user._id);
        bowl.memberCount += 1;
        await bowl.save();

        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { joinedBowls: req.params.id }
        });

        return successResponse(res, 200, {}, 'Joined bowl');
    } catch (error) {
        next(error);
    }
};

export const leaveBowl = async (req, res, next) => {
    try {
        const bowl = await Bowl.findById(req.params.id);

        if (!bowl) {
            return errorResponse(res, 404, 'Bowl not found');
        }

        bowl.members = bowl.members.filter(
            id => id.toString() !== req.user._id.toString()
        );
        bowl.memberCount = Math.max(0, bowl.memberCount - 1);
        await bowl.save();

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { joinedBowls: req.params.id }
        });

        return successResponse(res, 200, {}, 'Left bowl');
    } catch (error) {
        next(error);
    }
};
