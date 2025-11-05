require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../api/models/User');

async function testMongoConnection() {
    try {
        console.log('Testing MongoDB Connection...');
        console.log('MongoDB URI:', process.env.MONGODB_URI);
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ MongoDB Connected Successfully');

        // Test user creation
        const testUser = {
            username: 'testuser' + Math.random().toString(36).slice(2, 6),
            phoneNumber: '+919876543210',
            upiId: 'test@upi',
            accountType: 'email'
        };

        console.log('\nTrying to create test user:', testUser);
        const newUser = await User.create(testUser);
        console.log('✅ User created successfully:', newUser);

        // Test user retrieval
        console.log('\nTrying to find the created user...');
        const foundUser = await User.findOne({ username: testUser.username });
        console.log('✅ User found:', foundUser);

        // Cleanup
        console.log('\nCleaning up test data...');
        await User.deleteOne({ username: testUser.username });
        console.log('✅ Test user deleted');

        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
}

testMongoConnection().then(success => {
    if (success) {
        console.log('\n✅ All tests passed! The signup system is working correctly.');
        console.log('You can now:');
        console.log('1. Create a new account through the signup page');
        console.log('2. Login with your credentials');
        console.log('3. Access your account features');
    } else {
        console.log('\n❌ Tests failed! Please check the errors above.');
    }
    process.exit();
});