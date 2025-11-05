const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI2) {
      throw new Error('MONGODB_URI2 is not defined in environment variables');
    }

    const mongoURI = process.env.MONGODB_URI2;
    
    console.log('[database] Connecting to MongoDB...');
    
    const formattedURI = mongoURI.replace(/\+/g, '%2B');
    await mongoose.connect(formattedURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      ssl: true,
      directConnection: true,
      replicaSet: 'atlas-oncirn-shard-0',
      authSource: 'admin'
    });

    console.log('[database] MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('[database] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('[database] MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[database] MongoDB reconnected successfully');
    });

  } catch (error) {
    console.error('[database] MongoDB connection error:', error);
    process.exit(1);
  }
};

// Export the connection function
module.exports = connectDB;
