const mongoose = require('mongoose');
require('dotenv').config();
require('../models/Product');

const Product = mongoose.model('Product');

const products = [
    {
        name: 'Basic Investment Plan',
        category: 'Investment',
        price: 1000,
        total: 100,
        image: '/assets/images/investment-1.jpg',
        Plans: 'Basic',
        description: 'Start your investment journey with our basic plan',
        status: 'active'
    },
    {
        name: 'Premium Investment Plan',
        category: 'Investment',
        price: 5000,
        total: 50,
        image: '/assets/images/investment-2.jpg',
        Plans: 'Premium',
        description: 'Advanced investment options with higher returns',
        status: 'active'
    },
    {
        name: 'Gold Investment Plan',
        category: 'Investment',
        price: 10000,
        total: 25,
        image: '/assets/images/investment-3.jpg',
        Plans: 'Gold',
        description: 'Premium investment package for serious investors',
        status: 'active'
    }
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            appName: 'investloom7x'
        });
        
        console.log('Connected to MongoDB');
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');
        
        // Insert new products
        const result = await Product.insertMany(products);
        console.log('Added products:', result);
        
        mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
}

seedProducts();