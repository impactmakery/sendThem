import Redis from 'ioredis';
import { getEnv } from '../config/env';

let redis: Redis;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(getEnv().REDIS_URL, {
      maxRetriesPerRequest: null, // Required for BullMQ
    });
  }
  return redis;
}
