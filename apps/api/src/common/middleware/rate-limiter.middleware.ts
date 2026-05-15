import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../../config/redis';
import { ApiError } from '../middleware/error-handler.middleware';

const anonymousLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:anon:respond',
  points: 5,
  duration: 60 * 60,
});

const authenticatedLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:auth:respond',
  points: 20,
  duration: 60 * 60,
});

export async function applyResponseRateLimit(key: string, isAuthenticated: boolean): Promise<void> {
  const limiter = isAuthenticated ? authenticatedLimiter : anonymousLimiter;

  try {
    await limiter.consume(key);
  } catch {
    throw new ApiError(429, 'Too many submissions. Please try again later.', 'RATE_LIMITED');
  }
}
