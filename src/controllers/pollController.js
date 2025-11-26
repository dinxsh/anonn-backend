import Poll from '../models/Poll.js';
import Comment from '../models/Comment.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

/**
 * Poll Controller
 * Handles poll CRUD, voting, and results
 */

/**
 * @route   POST /api/polls
 * @desc    Create a new poll
 * @access  Private
 */
export const createPoll = async (req, res, next) => {
    try {
        const { question, description, options, bias, community, bowl, company, expiresAt } = req.body;

        // Validate options count
        if (!options || options.length < 2 || options.length > 4) {
            return errorResponse(res, 400, 'Poll must have between 2 and 4 options');
        }

        // Validate expiry date
        if (new Date(expiresAt) <= new Date()) {
            return errorResponse(res, 400, 'Expiry date must be in the future');
        }

        // Format options
        const formattedOptions = options.map(opt => ({
            text: opt,
            voteCount: 0,
            votes: [],
        }));

        const poll = await Poll.create({
            question,
            description,
            author: req.user._id,
            options: formattedOptions,
            bias: bias || 'neutral',
            community,
            bowl,
            company,
            expiresAt,
        });

        const populatedPoll = await Poll.findById(poll._id)
            .populate('author', 'username avatar')
            .populate('community', 'name displayName')
            .populate('company', 'name ticker logo');

        return successResponse(res, 201, { poll: populatedPoll }, 'Poll created successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/polls/:id
 * @desc    Get poll with results
 * @access  Public
 */
export const getPoll = async (req, res, next) => {
    try {
        const poll = await Poll.findById(req.params.id)
            .populate('author', 'username avatar')
            .populate('community', 'name displayName')
            .populate('company', 'name ticker logo');

        if (!poll || !poll.isActive) {
            return errorResponse(res, 404, 'Poll not found');
        }

        // Increment view count
        poll.viewCount += 1;
        await poll.save();

        const results = poll.getResults();

        const pollObj = {
            ...poll.toObject(),
            results,
            isExpired: poll.isExpired,
            totalVotes: poll.totalVotes,
        };

        return successResponse(res, 200, { poll: pollObj }, 'Poll retrieved');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/polls/:id/vote
 * @desc    Vote on poll
 * @access  Private
 */
export const votePoll = async (req, res, next) => {
    try {
        const { optionIndex } = req.body;
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return errorResponse(res, 404, 'Poll not found');
        }

        // Check if poll is expired or closed
        if (poll.isExpired || poll.isClosed) {
            return errorResponse(res, 400, 'Poll is closed for voting');
        }

        // Check if user has already voted
        if (poll.voters.includes(req.user._id)) {
            return errorResponse(res, 400, 'You have already voted on this poll');
        }

        // Validate option index
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return errorResponse(res, 400, 'Invalid option index');
        }

        // Add vote
        poll.options[optionIndex].votes.push(req.user._id);
        poll.options[optionIndex].voteCount += 1;
        poll.voters.push(req.user._id);

        await poll.save();

        const results = poll.getResults();

        return successResponse(res, 200, { results }, 'Vote recorded successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/polls
 * @desc    Get polls with filters
 * @access  Public
 */
export const getPolls = async (req, res, next) => {
    try {
        const { community, company, status = 'active', page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        let query = { isActive: true };

        if (community) {
            query.community = community;
        }

        if (company) {
            query.company = company;
        }

        if (status === 'active') {
            query.isClosed = false;
            query.expiresAt = { $gt: new Date() };
        } else if (status === 'closed') {
            query.$or = [
                { isClosed: true },
                { expiresAt: { $lte: new Date() } }
            ];
        }

        const polls = await Poll.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .populate('author', 'username avatar')
            .populate('community', 'name displayName')
            .populate('company', 'name ticker logo');

        const total = await Poll.countDocuments(query);

        const pollsWithResults = polls.map(poll => {
            const pollObj = poll.toObject();
            pollObj.results = poll.getResults();
            pollObj.totalVotes = poll.totalVotes;
            return pollObj;
        });

        return paginatedResponse(res, pollsWithResults, parseInt(page), parseInt(limit), total);

    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/polls/:id
 * @desc    Update poll
 * @access  Private
 */
export const updatePoll = async (req, res, next) => {
    try {
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return errorResponse(res, 404, 'Poll not found');
        }

        // Check authorization
        if (poll.author.toString() !== req.user._id.toString()) {
            return errorResponse(res, 403, 'Not authorized to update this poll');
        }

        // Only allow updating description if no votes yet
        if (poll.voters.length > 0) {
            return errorResponse(res, 400, 'Cannot update poll after votes have been cast');
        }

        const { question, description } = req.body;

        if (question) poll.question = question;
        if (description !== undefined) poll.description = description;

        await poll.save();

        return successResponse(res, 200, { poll }, 'Poll updated successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/polls/:id
 * @desc    Delete poll
 * @access  Private
 */
export const deletePoll = async (req, res, next) => {
    try {
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return errorResponse(res, 404, 'Poll not found');
        }

        // Check authorization
        if (poll.author.toString() !== req.user._id.toString()) {
            return errorResponse(res, 403, 'Not authorized to delete this poll');
        }

        // Soft delete
        poll.isActive = false;
        await poll.save();

        return successResponse(res, 200, {}, 'Poll deleted successfully');

    } catch (error) {
        next(error);
    }
};
