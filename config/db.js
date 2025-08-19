const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/investloom';
  console.log('[db] connecting to', uri && (uri.length>40 ? uri.slice(0,40)+'...' : uri));
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('[db] MongoDB connected');
  } catch (err) {
    console.error('[db] MongoDB connection error:', err && err.stack ? err.stack : err);
    // allow process to exit so Render will mark deploy failed
    process.exit(1);
  }
};

