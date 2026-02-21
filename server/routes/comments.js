import express from 'express';
import Comment from '../models/Comment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get comments for an article
router.get('/article/:articleId', async (req, res) => {
    try {
        const comments = await Comment.find({
            article: req.params.articleId,
            parentComment: null
        })
            .populate('author', 'name profilePicture')
            .sort({ createdAt: -1 });

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({ parentComment: comment._id })
                    .populate('author', 'name profilePicture')
                    .sort({ createdAt: 1 });
                return { ...comment.toObject(), replies };
            })
        );

        res.json({ comments: commentsWithReplies });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create comment
router.post('/', protect, async (req, res) => {
    try {
        const { content, articleId, parentCommentId } = req.body;
        const comment = await Comment.create({
            content,
            author: req.user._id,
            article: articleId,
            parentComment: parentCommentId || null
        });
        await comment.populate('author', 'name profilePicture');
        res.status(201).json({ comment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update comment
router.put('/:id', protect, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        comment.content = req.body.content;
        await comment.save();
        await comment.populate('author', 'name profilePicture');
        res.json({ comment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete comment
router.delete('/:id', protect, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        // Delete all replies too
        await Comment.deleteMany({ parentComment: comment._id });
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
