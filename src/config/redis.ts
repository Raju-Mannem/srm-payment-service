import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

export const redisClient =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

if (!globalForRedis.redis) {
  redisClient.on('error', (err) => logger.error({ err }, 'Redis Client Error'));

  redisClient.on('connect', () => logger.info('Connected to Redis'));

  if (env.NODE_ENV !== 'production') {
    globalForRedis.redis = redisClient;
  }
}
