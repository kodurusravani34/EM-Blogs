import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    }
}, {
    timestamps: true
});

// Ensure one bookmark per user per article
bookmarkSchema.index({ user: 1, article: 1 }, { unique: true });

export default mongoose.model('Bookmark', bookmarkSchema);
