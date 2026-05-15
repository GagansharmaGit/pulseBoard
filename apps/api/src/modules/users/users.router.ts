import { Router } from 'express';
import { requireAuth } from '../../common/guards/auth.guard';
import { usersController } from './users.controller';
import { asyncHandler } from '../../common/utils/async-handler';

const router: Router = Router();

router.get('/me', requireAuth, asyncHandler((req, res) => usersController.getMe(req, res)));
router.post('/sync', requireAuth, asyncHandler((req, res) => usersController.syncMe(req, res)));

export { router as usersRouter };
