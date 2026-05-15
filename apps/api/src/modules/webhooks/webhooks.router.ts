import { Router, Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { usersService } from '../users/users.service';
import { usersRepository } from '../users/users.repository';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { ApiError } from '../../common/middleware/error-handler.middleware';
import { asyncHandler } from '../../common/utils/async-handler';

const router: Router = Router();

function rawBodyMiddleware(req: Request, res: Response, next: NextFunction): void {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', (chunk: string) => { data += chunk; });
  req.on('end', () => {
    (req as Request & { rawBody: string }).rawBody = data;
    next();
  });
}

router.post(
  '/clerk',
  rawBodyMiddleware,
  asyncHandler(async (req: Request & { rawBody?: string }, res: Response) => {
    const secret = env.CLERK_WEBHOOK_SECRET;

    if (!secret) {
      throw ApiError.badRequest('Webhook secret not configured', 'WEBHOOK_NOT_CONFIGURED');
    }

    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw ApiError.badRequest('Missing Svix headers', 'INVALID_WEBHOOK');
    }

    const webhook = new Webhook(secret);
    let event: { type: string; data: Record<string, unknown> };

    try {
      event = webhook.verify(req.rawBody ?? '', {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as { type: string; data: Record<string, unknown> };
    } catch {
      throw ApiError.badRequest('Invalid webhook signature', 'INVALID_SIGNATURE');
    }

    logger.info({ eventType: event.type }, 'Clerk webhook received');

    if (event.type === 'user.created' || event.type === 'user.updated') {
      const userId = event.data.id as string;
      await usersService.syncFromClerk(userId);
    }

    if (event.type === 'user.deleted') {
      const userId = event.data.id as string;
      await usersRepository.deleteById(userId);
      logger.info({ userId }, 'User deleted via webhook');
    }

    res.json({ success: true });
  }),
);

export { router as webhooksRouter };
