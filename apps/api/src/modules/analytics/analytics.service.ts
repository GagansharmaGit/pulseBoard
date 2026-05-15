import { analyticsRepository, PollAnalytics } from './analytics.repository';
import { pollsService } from '../polls/polls.service';
import { ApiError } from '../../common/middleware/error-handler.middleware';

export class AnalyticsService {
  async getPollAnalytics(pollId: string, userId: string | undefined): Promise<PollAnalytics> {
    const poll = await pollsService.getById(pollId);

    if (poll.status === 'draft') {
      throw ApiError.notFound('Poll not found');
    }

    const isCreator = poll.creatorId === userId;
    const isPublished = poll.status === 'published';

    if (!isCreator && !isPublished) {
      throw ApiError.forbidden('Results are not public yet');
    }

    return analyticsRepository.getPollAnalytics(pollId);
  }
}

export const analyticsService = new AnalyticsService();
