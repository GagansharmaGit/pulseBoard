import { Router } from 'express';
import { requireAuth, optionalAuth } from '../../common/guards/auth.guard';
import { pollsController } from './polls.controller';
import { asyncHandler } from '../../common/utils/async-handler';

const router: Router = Router();

router.post('/', requireAuth, asyncHandler((req, res) => pollsController.create(req, res)));
router.get('/me', requireAuth, asyncHandler((req, res) => pollsController.getMyPolls(req, res)));
router.get('/:id', optionalAuth, asyncHandler((req, res) => pollsController.getById(req, res)));
router.put('/:id', requireAuth, asyncHandler((req, res) => pollsController.update(req, res)));
router.delete('/:id', requireAuth, asyncHandler((req, res) => pollsController.delete(req, res)));
router.patch('/:id/activate', requireAuth, asyncHandler((req, res) => pollsController.activate(req, res)));
router.patch('/:id/close', requireAuth, asyncHandler((req, res) => pollsController.close(req, res)));
router.patch('/:id/publish', requireAuth, asyncHandler((req, res) => pollsController.publish(req, res)));

export { router as pollsRouter };
