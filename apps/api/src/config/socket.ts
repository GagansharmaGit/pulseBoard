import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { redis } from './redis';
import { env } from './env';
import { logger } from './logger';
import Redis from 'ioredis';

let io: SocketIOServer;

export function initializeSocket(httpServer: HttpServer): SocketIOServer {
  const pubClient = redis;
  // Create a separate connection for subscribing as required by the Redis adapter
  const subClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
    adapter: createAdapter(pubClient, subClient),
  });

  io.on('connection', (socket) => {
    logger.debug({ socketId: socket.id }, 'Socket client connected');

    socket.on('subscribe_poll', (pollId: string) => {
      socket.join(`poll:${pollId}`);
      logger.debug({ socketId: socket.id, pollId }, 'Socket subscribed to poll');
    });

    socket.on('unsubscribe_poll', (pollId: string) => {
      socket.leave(`poll:${pollId}`);
      logger.debug({ socketId: socket.id, pollId }, 'Socket unsubscribed from poll');
    });

    socket.on('disconnect', () => {
      logger.debug({ socketId: socket.id }, 'Socket client disconnected');
    });
  });

  logger.info({ env: env.NODE_ENV }, 'Socket.io initialized with Redis adapter');
  return io;
}

export function getSocketServer(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initializeSocket first.');
  }
  return io;
}
