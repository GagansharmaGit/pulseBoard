import { Router } from 'express';
import { optionalAuth } from '../../common/guards/auth.guard';
import { responsesController } from './responses.controller';
import { asyncHandler } from '../../common/utils/async-handler';

const router: Router = Router({ mergeParams: true });

router.post('/', optionalAuth, asyncHandler((req, res) => responsesController.submit(req, res)));

export { router as responsesRouter };
