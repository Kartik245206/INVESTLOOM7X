
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investloom7x';
    
    console.log('[database] Connecting to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('[database] MongoDB connected successfully');
  } catch (error) {
    console.error('[database] MongoDB connection error:', error);
    console.error('[database] Error stack:', error.stack);
    process.exit(1);
  }
};

module.exports = connectDB;
