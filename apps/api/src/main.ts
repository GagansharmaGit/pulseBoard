import './types/express.d';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { redis } from './config/redis';
import { pool } from './config/database';
import { initializeSocket } from './config/socket';

async function bootstrap() {
  await redis.connect();

  const app = createApp();
  
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started');
  });

  initializeSocket(server);

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received, starting graceful shutdown');

    server.close(async () => {
      try {
        await redis.quit();
        await pool.end();
        logger.info('All connections closed, process exiting');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught exception');
    shutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
    shutdown('unhandledRejection');
  });
}

bootstrap().catch((err) => {
  process.stderr.write(`Failed to start server: ${err}\n`);
  process.exit(1);
});
