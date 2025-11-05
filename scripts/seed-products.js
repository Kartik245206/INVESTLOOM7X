require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../api/models/Product');

const sampleProducts = [
    {
        name: 'Basic Investment Plan',
        category: 'Starter',
        price: 1000,
        dailyEarning: 50,
        duration: 100,
        description: 'Perfect for beginners looking to start their investment journey.',
        imageUrl: '/assets/images/discover-01.jpg',
        isActive: true
    },
    {
        name: 'Premium Investment Plan',
        category: 'Advanced',
        price: 5000,
        dailyEarning: 300,
        duration: 100,
        description: 'For experienced investors seeking higher returns. Balanced risk-reward ratio.',
        imageUrl: '/assets/images/discover-02.jpg',
        isActive: true
    },
    {
        name: 'Elite Investment Plan',
        category: 'Professional',
        price: 10000,
        dailyEarning: 700,
        duration: 100,
        description: 'Maximum returns for professional investors. Premium features and priority support.',
        imageUrl: '/assets/images/discover-03.jpg',
        isActive: true
    },
    {
        name: 'Gold Investment Plan',
        category: 'Premium',
        price: 25000,
        dailyEarning: 2000,
        duration: 100,
        description: 'Exclusive plan with highest returns. VIP support and advanced analytics.',
        imageUrl: '/assets/images/discover-01.jpg',
        isActive: true
    },
    {
        name: 'Platinum Investment Plan',
        category: 'Elite',
        price: 50000,
        dailyEarning: 4500,
        duration: 100,
        description: 'Ultimate investment plan for serious investors. Maximum returns with premium benefits.',
        imageUrl: '/assets/images/discover-02.jpg',
        isActive: true
    }
];

async function seedProducts() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected successfully');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert new products
        const result = await Product.insertMany(sampleProducts);
        console.log(`Seeded ${result.length} products successfully`);

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

seedProducts();