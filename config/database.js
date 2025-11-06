const mongoose = require('mongoose');

const validateMongoURI = (uri) => {
  if (!uri) return false;
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    return false;
  }
  try {
    const url = new URL(uri);
    return url.protocol && url.hostname;
  } catch (e) {
    return false;
  }
};

const getMaskedURI = (uri) => {
  if (!uri) return '';
  try {
    const url = new URL(uri);
    const maskedAuth = url.username ? '****:****@' : '';
    return `${url.protocol}//${maskedAuth}${url.host}${url.pathname}`;
  } catch (e) {
    return uri.substring(0, 10) + '...';
  }
};

// Create separate connections for users and products
const connections = {
  users: null,    // Will store user database connection
  products: null  // Will store products database connection
};

const connectDB = async () => {
  try {
    // Connect to User Database (MONGODB_URI2)
    const userDbURI = process.env.MONGODB_URI2;
    if (!userDbURI) {
      throw new Error('MONGODB_URI2 not found - required for user data');
    }
    if (!validateMongoURI(userDbURI)) {
      throw new Error(`Invalid MONGODB_URI2 format: ${getMaskedURI(userDbURI)}`);
    }
    
    // Connect to Product Database (MONGODB_URI)
    const productDbURI = process.env.MONGODB_URI;
    if (!productDbURI) {
      throw new Error('MONGODB_URI not found - required for product data');
    }
    if (!validateMongoURI(productDbURI)) {
      throw new Error(`Invalid MONGODB_URI format: ${getMaskedURI(productDbURI)}`);
    }

    // Configure connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      ssl: true,
      authSource: 'admin'
    };

    // Create connections
    console.log('[database] Connecting to User Database...');
    connections.users = await mongoose.createConnection(userDbURI, options);
    console.log('[database] User Database connected successfully');

    console.log('[database] Connecting to Product Database...');
    connections.products = await mongoose.createConnection(productDbURI, options);
    console.log('[database] Product Database connected successfully');

    // Set up connection event handlers for both connections
    [connections.users, connections.products].forEach((conn, index) => {
      const dbType = index === 0 ? 'User' : 'Product';
      
      conn.on('error', (err) => {
        console.error(`[database] ${dbType} Database connection error:`, err);
      });

      conn.on('disconnected', () => {
        console.log(`[database] ${dbType} Database disconnected. Attempting to reconnect...`);
      });

      conn.on('reconnected', () => {
        console.log(`[database] ${dbType} Database reconnected successfully`);
      });
    });

  } catch (error) {
    console.error('\n[database] Configuration Error:\n', error.message);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Export both the connection function and connections object
module.exports = {
  connectDB,
  connections
};
