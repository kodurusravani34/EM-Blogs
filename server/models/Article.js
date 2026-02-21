import mongoose from 'mongoose';
import slugify from 'slugify';

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        unique: true
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    excerpt: {
        type: String,
        default: ''
    },
    coverImage: {
        type: String,
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    keywords: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    readingTime: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Generate slug and calculate reading time before saving
articleSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    }
    if (this.isModified('content')) {
        const text = this.content.replace(/<[^>]*>/g, '');
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (this.isModified('content') && !this.excerpt) {
        const text = this.content.replace(/<[^>]*>/g, '');
        this.excerpt = text.substring(0, 160) + (text.length > 160 ? '...' : '');
    }
    next();
});

// Index for search
articleSchema.index({ title: 'text', content: 'text', keywords: 'text' });

export default mongoose.model('Article', articleSchema);
