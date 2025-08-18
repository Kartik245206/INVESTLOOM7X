const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use MongoDB Atlas URI from environment variable
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/investloom';
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;

