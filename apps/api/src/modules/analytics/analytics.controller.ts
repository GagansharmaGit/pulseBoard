import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';

export class AnalyticsController {
  async getAnalytics(req: Request, res: Response): Promise<void> {
    const analytics = await analyticsService.getPollAnalytics(req.params.pollId, req.userId);

    res.json({
      success: true,
      data: { analytics },
      requestId: req.requestId,
    });
  }
}

export const analyticsController = new AnalyticsController();
