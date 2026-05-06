import { redisClient } from '../config/redis';

const IDEMPOTENCY_TTL = 60 * 60 * 24;

export const checkIdempotency = async (key: string): Promise<string | null> => {
  return await redisClient.get(`idempotency:${key}`);
};

export const cacheIdempotency = async (key: string, response: unknown): Promise<void> => {
  await redisClient.setex(`idempotency:${key}`, IDEMPOTENCY_TTL, JSON.stringify(response));
};
