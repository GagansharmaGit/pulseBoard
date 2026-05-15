import { Request, Response } from 'express';
import { usersService } from './users.service';

export class UsersController {
  async getMe(req: Request, res: Response): Promise<void> {
    const user = await usersService.getOrSync(req.userId!);

    res.json({
      success: true,
      data: { user },
      requestId: req.requestId,
    });
  }

  async syncMe(req: Request, res: Response): Promise<void> {
    const user = await usersService.syncFromClerk(req.userId!);

    res.json({
      success: true,
      data: { user },
      requestId: req.requestId,
    });
  }
}

export const usersController = new UsersController();
