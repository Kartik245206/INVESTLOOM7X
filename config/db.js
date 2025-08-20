const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in environment');
    throw new Error('MONGODB_URI not set');
  }

  try {
    await mongoose.connect(uri, {
      // options for mongoose v6+ are not required but can be added
      // useNewUrlParser, useUnifiedTopology are defaults in modern mongoose
    });
    console.log('MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // optional: retry logic
    setTimeout(() => connectDB(), 5000);
    throw err;
  }
};

module.exports = connectDB;
