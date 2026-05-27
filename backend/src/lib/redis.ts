import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null
});

redis.on('connect', () => {
  console.log('Connected to Redis.');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export const setCache = async (key: string, value: any, ttlSeconds: number) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

export const getCache = async (key: string) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
};
