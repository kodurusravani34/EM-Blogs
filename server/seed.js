import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Seed admin user
const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = (await import('./models/User.js')).default;

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@blog.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'change_this_immediately';

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists');
        } else {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                bio: 'EM Blogs Platform Administrator'
            });
            console.log('✅ Admin user created successfully');
            console.log(`   Email: ${adminEmail}`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seedAdmin();
