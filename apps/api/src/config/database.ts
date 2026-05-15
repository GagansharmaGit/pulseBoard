import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { env } from './env';
import { logger } from './logger';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
});

pool.on('connect', () => {
  logger.debug('New PostgreSQL client connected');
});

export const db = drizzle(pool, { schema });
export { pool };
