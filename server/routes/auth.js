import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = generateToken(user._id);
        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, role: 'admin' }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }
        const token = generateToken(user._id);
        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current user
router.get('/me', protect, async (req, res) => {
    res.json({
        user: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            bio: req.user.bio,
            profilePicture: req.user.profilePicture,
            role: req.user.role,
            links: req.user.links
        }
    });
});

// Update profile
router.put('/profile', protect, upload.single('profilePicture'), async (req, res) => {
    try {
        const { name, bio, links } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (links) {
            try {
                updateData.links = JSON.parse(links);
            } catch (e) {
                console.error('Error parsing links:', e);
            }
        }
        if (req.file) {
            updateData.profilePicture = `/uploads/${req.file.filename}`;
        }
        const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture,
                role: user.role,
                links: user.links
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user profile by ID
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture,
                role: user.role,
                links: user.links,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
