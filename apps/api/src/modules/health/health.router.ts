import { Router, Request, Response } from 'express';
import { db } from '../../config/database';
import { redis } from '../../config/redis';
import { sql } from 'drizzle-orm';

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  const checks: Record<string, string> = {
    api: 'ok',
    database: 'unknown',
    redis: 'unknown',
  };

  try {
    await db.execute(sql`SELECT 1`);
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  try {
    await redis.ping();
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
  }

  const isHealthy = Object.values(checks).every((v) => v === 'ok');

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: {
      status: isHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    },
  });
});

export { router as healthRouter };
