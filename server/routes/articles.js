import express from 'express';
import Article from '../models/Article.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get all published articles (with pagination and keyword filter)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const keyword = req.query.keyword;
        const skip = (page - 1) * limit;

        const filter = { status: 'published' };
        if (keyword) {
            filter.keywords = { $in: [keyword.toLowerCase()] };
        }

        const [articles, total] = await Promise.all([
            Article.find(filter)
                .populate('author', 'name profilePicture')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Article.countDocuments(filter)
        ]);

        res.json({
            articles,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all keywords with counts
router.get('/keywords', async (req, res) => {
    try {
        const keywords = await Article.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$keywords' },
            { $group: { _id: '$keywords', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 30 }
        ]);
        res.json(keywords.map(k => ({ keyword: k._id, count: k.count })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search articles
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ articles: [] });

        const articles = await Article.find({
            status: 'published',
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } },
                { keywords: { $in: [q.toLowerCase()] } }
            ]
        })
            .populate('author', 'name profilePicture')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ articles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get articles by user (with keyword grouping)
router.get('/user/:userId', async (req, res) => {
    try {
        const { keyword } = req.query;
        const filter = { author: req.params.userId, status: 'published' };
        if (keyword) {
            filter.keywords = { $in: [keyword.toLowerCase()] };
        }

        const articles = await Article.find(filter)
            .populate('author', 'name profilePicture')
            .sort({ createdAt: -1 });

        // Get keyword stats for this user
        const keywordStats = await Article.aggregate([
            { $match: { author: articles.length > 0 ? articles[0].author._id : null, status: 'published' } },
            { $unwind: '$keywords' },
            { $group: { _id: '$keywords', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            articles,
            keywordStats: keywordStats.map(k => ({ keyword: k._id, count: k.count }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single article by slug
router.get('/slug/:slug', optionalAuth, async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug })
            .populate('author', 'name profilePicture bio');
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json({ article, isLiked: req.user ? article.likes.includes(req.user._id) : false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get my drafts
router.get('/my/drafts', protect, async (req, res) => {
    try {
        const articles = await Article.find({ author: req.user._id, status: 'draft' })
            .sort({ updatedAt: -1 });
        res.json({ articles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get my articles
router.get('/my/articles', protect, async (req, res) => {
    try {
        const articles = await Article.find({ author: req.user._id })
            .sort({ createdAt: -1 });
        res.json({ articles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create article
router.post('/', protect, upload.single('coverImage'), async (req, res) => {
    try {
        const { title, content, excerpt, keywords, status } = req.body;
        const articleData = {
            title,
            content,
            excerpt,
            author: req.user._id,
            status: status || 'draft',
            keywords: keywords ? (typeof keywords === 'string' ? JSON.parse(keywords) : keywords) : []
        };
        if (req.file) {
            articleData.coverImage = `/uploads/${req.file.filename}`;
        }
        const article = await Article.create(articleData);
        await article.populate('author', 'name profilePicture');
        res.status(201).json({ article });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update article
router.put('/:id', protect, upload.single('coverImage'), async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const { title, content, excerpt, keywords, status } = req.body;
        if (title) article.title = title;
        if (content) article.content = content;
        if (excerpt !== undefined) article.excerpt = excerpt;
        if (status) article.status = status;
        if (keywords) {
            article.keywords = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;
        }
        if (req.file) {
            article.coverImage = `/uploads/${req.file.filename}`;
        }
        await article.save();
        await article.populate('author', 'name profilePicture');
        res.json({ article });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete article
router.delete('/:id', protect, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Article.findByIdAndDelete(req.params.id);
        res.json({ message: 'Article deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Like/Unlike article
router.post('/:id/like', protect, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        const likeIndex = article.likes.indexOf(req.user._id);
        if (likeIndex > -1) {
            article.likes.splice(likeIndex, 1);
        } else {
            article.likes.push(req.user._id);
        }
        await article.save();
        res.json({ likes: article.likes.length, isLiked: article.likes.includes(req.user._id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get article by ID (for editing)
router.get('/:id', protect, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('author', 'name profilePicture');
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json({ article });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
