import express from 'express';
import Bookmark from '../models/Bookmark.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get user's bookmarks
router.get('/', protect, async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.user._id })
            .populate({
                path: 'article',
                populate: { path: 'author', select: 'name profilePicture' }
            })
            .sort({ createdAt: -1 });

        // Filter out bookmarks where article was deleted
        const validBookmarks = bookmarks.filter(b => b.article);
        res.json({ bookmarks: validBookmarks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check if article is bookmarked
router.get('/check/:articleId', protect, async (req, res) => {
    try {
        const bookmark = await Bookmark.findOne({
            user: req.user._id,
            article: req.params.articleId
        });
        res.json({ isBookmarked: !!bookmark });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle bookmark
router.post('/toggle', protect, async (req, res) => {
    try {
        const { articleId } = req.body;
        const existing = await Bookmark.findOne({
            user: req.user._id,
            article: articleId
        });
        if (existing) {
            await Bookmark.findByIdAndDelete(existing._id);
            res.json({ isBookmarked: false });
        } else {
            await Bookmark.create({ user: req.user._id, article: articleId });
            res.json({ isBookmarked: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
