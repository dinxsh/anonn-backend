import Company from '../models/Company.js';
import Market from '../models/Market.js';
import Post from '../models/Post.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Company Controller  
 * Handles company CRUD, sentiment tracking, and market management
 */

export const createCompany = async (req, res, next) => {
    try {
        const { name, ticker, description, logo, sector, website } = req.body;

        const company = await Company.create({
            name,
            ticker,
            description,
            logo,
            sector,
            website,
        });

        return successResponse(res, 201, { company }, 'Company created');
    } catch (error) {
        next(error);
    }
};

export const getCompanies = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, sector } = req.query;
        const skip = (page - 1) * limit;

        let query = { isActive: true };
        if (sector) query.sector = sector;

        const companies = await Company.find(query)
            .sort({ followerCount: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Company.countDocuments(query);

        return successResponse(res, 200, { companies, total }, 'Companies retrieved');
    } catch (error) {
        next(error);
    }
};

export const getCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id)
            .populate('insiders.user', 'username avatar');

        if (!company) {
            return errorResponse(res, 404, 'Company not found');
        }

        return successResponse(res, 200, { company }, 'Company retrieved');
    } catch (error) {
        next(error);
    }
};

export const addSentiment = async (req, res, next) => {
    try {
        const { sentiment } = req.body; // 'bullish' or 'bearish'
        const company = await Company.findById(req.params.id);

        if (!company) {
            return errorResponse(res, 404, 'Company not found');
        }

        if (sentiment === 'bullish') {
            if (!company.bullishUsers.includes(req.user._id)) {
                company.bullishUsers.push(req.user._id);
                company.bullishCount += 1;
                // Remove from bearish if exists
                company.bearishUsers = company.bearishUsers.filter(
                    id => id.toString() !== req.user._id.toString()
                );
                if (company.bearishCount > 0) company.bearishCount -= 1;
            }
        } else if (sentiment === 'bearish') {
            if (!company.bearishUsers.includes(req.user._id)) {
                company.bearishUsers.push(req.user._id);
                company.bearishCount += 1;
                // Remove from bullish if exists
                company.bullishUsers = company.bullishUsers.filter(
                    id => id.toString() !== req.user._id.toString()
                );
                if (company.bullishCount > 0) company.bullishCount -= 1;
            }
        } else {
            return errorResponse(res, 400, 'Invalid sentiment');
        }

        await company.save();

        return successResponse(res, 200, {
            sentimentScore: company.sentimentScore,
            bullishCount: company.bullishCount,
            bearishCount: company.bearishCount,
        }, 'Sentiment recorded');
    } catch (error) {
        next(error);
    }
};

export const getCompanyPosts = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ companyTags: req.params.id, isActive: true })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .populate('author', 'username avatar');

        const total = await Post.countDocuments({ companyTags: req.params.id, isActive: true });

        return successResponse(res, 200, { posts, total }, 'Posts retrieved');
    } catch (error) {
        next(error);
    }
};

export const createMarket = async (req, res, next) => {
    try {
        const { question, description, expiresAt } = req.body;

        const market = await Market.create({
            company: req.params.id,
            creator: req.user._id,
            question,
            description,
            expiresAt,
            type: 'binary',
            options: [
                { label: 'Yes', totalShares: 0 },
                { label: 'No', totalShares: 0 }
            ],
        });

        // Add to company's markets
        await Company.findByIdAndUpdate(req.params.id, {
            $push: { markets: market._id }
        });

        return successResponse(res, 201, { market }, 'Market created');
    } catch (error) {
        next(error);
    }
};

export const getCompanyMarkets = async (req, res, next) => {
    try {
        const markets = await Market.find({
            company: req.params.id,
            isActive: true
        })
            .sort({ createdAt: -1 })
            .populate('creator', 'username avatar');

        return successResponse(res, 200, { markets }, 'Markets retrieved');
    } catch (error) {
        next(error);
    }
};

export const tradeMarket = async (req, res, next) => {
    try {
        const { option, shares, action } = req.body; // option: 'yes'/'no', action: 'buy'/'sell'
        const market = await Market.findById(req.params.marketId);

        if (!market) {
            return errorResponse(res, 404, 'Market not found');
        }

        if (market.isExpired || market.isResolved) {
            return errorResponse(res, 400, 'Market is closed');
        }

        // Simplified trading logic
        if (action === 'buy') {
            const price = option === 'yes' ? market.yesPrice : market.noPrice;
            const cost = shares * price;

            market.positions.push({
                user: req.user._id,
                option,
                shares,
                averagePrice: price,
                investedAmount: cost,
            });

            market.totalVolume += cost;
            market.updatePrices();
        }

        await market.save();

        return successResponse(res, 200, { market }, 'Trade executed');
    } catch (error) {
        next(error);
    }
};
