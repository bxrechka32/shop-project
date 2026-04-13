// backend/src/config/redis.js
const Redis = require('ioredis');

let redis;

async function connectRedis() {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
    });
    await redis.connect();
    console.log('✅ Redis connected');
  } catch (err) {
    console.error('Redis connection error:', err.message);
    redis = null;
  }
}

function getRedis() {
  return redis;
}

module.exports = { connectRedis, getRedis };
