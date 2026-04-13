// backend/src/config/mongodb.js
const mongoose = require('mongoose');

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shop_logs');
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

module.exports = { connectMongo };
