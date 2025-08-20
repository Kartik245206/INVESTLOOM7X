const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[db] MONGODB_URI not set');
    throw new Error('MONGODB_URI not set');
  }

  try {
    // avoid deprecation warnings and get useful logging
    await mongoose.connect(uri, {
      appName: 'investloom7x',
      // mongoose v6+ uses sensible defaults; add options only if needed
    });
    console.log('[db] Connected to MongoDB');
    mongoose.connection.on('disconnected', () => {
      console.warn('[db] MongoDB disconnected');
    });
    mongoose.connection.on('error', (err) => {
      console.error('[db] MongoDB connection error', err);
    });
  } catch (err) {
    console.error('[db] Failed to connect to MongoDB', err);
    // rethrow so server can decide to exit or retry
    throw err;
  }
}

module.exports = connectDB;
