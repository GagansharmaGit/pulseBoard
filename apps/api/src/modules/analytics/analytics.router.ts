import { Router } from 'express';
import { optionalAuth } from '../../common/guards/auth.guard';
import { analyticsController } from './analytics.controller';
import { asyncHandler } from '../../common/utils/async-handler';

const router: Router = Router({ mergeParams: true });

router.get('/', optionalAuth, asyncHandler((req, res) => analyticsController.getAnalytics(req, res)));

export { router as analyticsRouter };
