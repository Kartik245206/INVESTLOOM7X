
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI2) {
      throw new Error('MONGODB_URI2 is not defined in environment variables');
    }

    const mongoURI = process.env.MONGODB_URI2;
    
    console.log('[database] Connecting to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
    });
    
    // Handle initial connection errors
    mongoose.connection.on('error', (error) => {
      console.error('[database] MongoDB connection error:', error);
      throw error;
    });

    // Handle errors after initial connection
    mongoose.connection.on('disconnected', () => {
      console.error('[database] Lost MongoDB connection. Retrying...');
    });

    console.log('[database] MongoDB connected successfully');
  } catch (error) {
    console.error('[database] MongoDB connection error:', error);
    console.error('[database] Error stack:', error.stack);
    throw error; // Let the server handle the error instead of exiting
  }
};

module.exports = connectDB;
