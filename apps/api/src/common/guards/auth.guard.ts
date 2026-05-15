import { Request, Response, NextFunction } from 'express';
import { clerkClient, getAuth } from '@clerk/express';
import { ApiError } from '../middleware/error-handler.middleware';
import { logger } from '../../config/logger';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);

  if (!userId) {
    return next(ApiError.unauthorized());
  }

  req.userId = userId;
  logger.debug({ requestId: req.requestId, userId }, 'Auth guard passed');
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);

  if (userId) {
    req.userId = userId;
  }

  next();
}

export async function resolveClerkUser(userId: string) {
  const user = await clerkClient.users.getUser(userId);
  return {
    id: userId,
    email: user.emailAddresses[0]?.emailAddress ?? '',
    name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || 'Anonymous',
    avatarUrl: user.imageUrl ?? null,
  };
}
