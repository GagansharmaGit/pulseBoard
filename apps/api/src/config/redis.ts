import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableOfflineQueue: false,
  tls: (env.REDIS_URL.startsWith('rediss://') || env.REDIS_URL.includes('upstash.io')) ? {} : undefined,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('ready', () => logger.info('Redis ready'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));
redis.on('close', () => logger.warn('Redis connection closed'));
redis.on('reconnecting', (ms: number) => logger.warn({ ms }, 'Redis reconnecting'));
