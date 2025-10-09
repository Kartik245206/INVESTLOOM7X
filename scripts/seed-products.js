const mongoose = require('mongoose');
require('dotenv').config();

async function seedProducts() {
    try {
        console.log('🌱 Starting seed process...');
        console.log('📡 Connecting to MongoDB...');
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected to MongoDB');
        
        // Load Product model
        require('../models/Product');
        const Product = mongoose.model('Product');
        
        // Check existing products
        const existingCount = await Product.countDocuments();
        console.log(`📊 Existing products in database: ${existingCount}`);
        
        if (existingCount > 0) {
            console.log('⚠️  Products already exist. Do you want to clear them? (Y/N)');
            console.log('   Skipping clear for now. Run with --clear flag to remove existing products.');
        }
        
        console.log('📦 Creating sample products...');
        
        const sampleProducts = [
            {
                name: 'Basic Investment Plan',
                category: 'Starter',
                price: 1000,
                dailyEarning: 50,
                duration: 100,
                description: 'Perfect for beginners looking to start their investment journey. Low risk with steady returns.',
                imageUrl: 'assets/images/discover-01.jpg',
                image: 'assets/images/discover-01.jpg',
                isActive: true
            },
            {
                name: 'Premium Investment Plan',
                category: 'Advanced',
                price: 5000,
                dailyEarning: 300,
                duration: 100,
                description: 'For experienced investors seeking higher returns. Balanced risk-reward ratio.',
                imageUrl: 'assets/images/discover-02.jpg',
                image: 'assets/images/discover-02.jpg',
                isActive: true
            },
            {
                name: 'Elite Investment Plan',
                category: 'Professional',
                price: 10000,
                dailyEarning: 700,
                duration: 100,
                description: 'Maximum returns for professional investors. Premium features and priority support.',
                imageUrl: 'assets/images/discover-03.jpg',
                image: 'assets/images/discover-03.jpg',
                isActive: true
            },
            {
                name: 'Gold Investment Plan',
                category: 'Premium',
                price: 25000,
                dailyEarning: 2000,
                duration: 100,
                description: 'Exclusive plan with highest returns. VIP support and advanced analytics.',
                imageUrl: 'assets/images/discover-01.jpg',
                image: 'assets/images/discover-01.jpg',
                isActive: true
            },
            {
                name: 'Platinum Investment Plan',
                category: 'Elite',
                price: 50000,
                dailyEarning: 4500,
                duration: 100,
                description: 'Ultimate investment plan for serious investors. Maximum returns with premium benefits.',
                imageUrl: 'assets/images/discover-02.jpg',
                image: 'assets/images/discover-02.jpg',
                isActive: true
            }
        ];
        
        // Insert products
        const result = await Product.insertMany(sampleProducts);
        console.log(`✅ Successfully created ${result.length} products`);
        
        // Display all products
        const allProducts = await Product.find().sort({ price: 1 });
        console.log('\n📋 All Products in Database:');
        console.log('═══════════════════════════════════════════════════════════');
        allProducts.forEach((p, index) => {
            console.log(`${index + 1}. ${p.name}`);
            console.log(`   Category: ${p.category}`);
            console.log(`   Price: ₹${p.price.toLocaleString()}`);
            console.log(`   Daily Earning: ₹${p.dailyEarning.toLocaleString()}`);
            console.log(`   Total Return: ₹${(p.dailyEarning * p.duration).toLocaleString()}`);
            console.log(`   ROI: ${((p.dailyEarning * p.duration / p.price - 1) * 100).toFixed(2)}%`);
            console.log('───────────────────────────────────────────────────────────');
        });
        
        console.log(`\n✅ Total products: ${allProducts.length}`);
        console.log('🎉 Seed completed successfully!');
        
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run seed
seedProducts();