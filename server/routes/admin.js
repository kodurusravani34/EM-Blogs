import express from 'express';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// Dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, totalArticles, totalComments, recentUsers, recentArticles] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Article.countDocuments({ status: 'published' }),
            Comment.countDocuments(),
            User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt isBlocked'),
            Article.find({ status: 'published' }).sort({ createdAt: -1 }).limit(5)
                .populate('author', 'name')
                .select('title slug createdAt likes')
        ]);

        // Articles per day for last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const articlesPerDay = await Article.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, status: 'published' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalUsers,
            totalArticles,
            totalComments,
            recentUsers,
            recentArticles,
            articlesPerDay
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Block/Unblock user
router.put('/users/:id/block', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({ user, message: user.isBlocked ? 'User blocked' : 'User unblocked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Also delete their articles and comments
        await Article.deleteMany({ author: req.params.id });
        await Comment.deleteMany({ author: req.params.id });
        res.json({ message: 'User and their content deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all articles (admin)
router.get('/articles', async (req, res) => {
    try {
        const articles = await Article.find()
            .populate('author', 'name email')
            .sort({ createdAt: -1 });
        res.json({ articles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete article (admin)
router.delete('/articles/:id', async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ article: req.params.id });
        res.json({ message: 'Article and comments deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all comments (admin)
router.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('author', 'name email')
            .populate('article', 'title slug')
            .sort({ createdAt: -1 });
        res.json({ comments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete comment (admin)
router.delete('/comments/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (comment) {
            await Comment.deleteMany({ parentComment: comment._id });
            await Comment.findByIdAndDelete(req.params.id);
        }
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
