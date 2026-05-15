import { pollsRepository, PollWithDetails, PollSummary } from './polls.repository';
import { ApiError } from '../../common/middleware/error-handler.middleware';
import { redis } from '../../config/redis';
import { logger } from '../../config/logger';
import { Poll } from '../../database/schema/polls';

const POLL_CACHE_TTL = 60;
const pollCacheKey = (id: string) => `poll:${id}`;

export class PollsService {
  async create(
    creatorId: string,
    input: {
      title: string;
      description?: string;
      isAnonymous: boolean;
      expiresAt?: string | null;
      questions: Array<{
        text: string;
        orderIndex: number;
        isRequired: boolean;
        options: Array<{ text: string; orderIndex: number }>;
      }>;
    },
  ): Promise<Poll> {
    const poll = await pollsRepository.create(creatorId, input);
    logger.info({ pollId: poll.id, creatorId }, 'Poll created');
    return poll;
  }

  async getById(id: string): Promise<NonNullable<PollWithDetails>> {
    const cached = await redis.get(pollCacheKey(id));
    if (cached) {
      return JSON.parse(cached) as NonNullable<PollWithDetails>;
    }

    const poll = await pollsRepository.findById(id);
    if (!poll) {
      throw ApiError.notFound('Poll not found');
    }

    await redis.set(pollCacheKey(id), JSON.stringify(poll), 'EX', POLL_CACHE_TTL);
    return poll;
  }

  async getPublicPoll(id: string): Promise<NonNullable<PollWithDetails>> {
    const poll = await this.getById(id);

    if (poll.status === 'draft') {
      throw ApiError.notFound('Poll not found');
    }

    return poll;
  }

  async getMyPolls(creatorId: string): Promise<PollSummary[]> {
    return pollsRepository.findByCreatorId(creatorId);
  }

  async activate(id: string, creatorId: string): Promise<Poll> {
    const poll = await this.getById(id);
    this.assertOwner(poll, creatorId);

    if (poll.questions.length === 0) {
      throw ApiError.badRequest('Poll must have at least one question before activating', 'NO_QUESTIONS');
    }

    if (poll.status !== 'draft') {
      throw ApiError.badRequest('Only draft polls can be activated', 'INVALID_STATUS_TRANSITION');
    }

    const updated = await pollsRepository.updateStatus(id, 'active');
    await this.invalidateCache(id);

    logger.info({ pollId: id }, 'Poll activated');
    return updated;
  }

  async close(id: string, creatorId: string): Promise<Poll> {
    const poll = await this.getById(id);
    this.assertOwner(poll, creatorId);

    if (poll.status !== 'active') {
      throw ApiError.badRequest('Only active polls can be closed', 'INVALID_STATUS_TRANSITION');
    }

    const updated = await pollsRepository.updateStatus(id, 'closed');
    await this.invalidateCache(id);

    logger.info({ pollId: id }, 'Poll closed');
    return updated;
  }

  async publish(id: string, creatorId: string): Promise<Poll> {
    const poll = await this.getById(id);
    this.assertOwner(poll, creatorId);

    if (poll.status !== 'closed' && poll.status !== 'active') {
      throw ApiError.badRequest('Poll must be active or closed before publishing', 'INVALID_STATUS_TRANSITION');
    }

    const updated = await pollsRepository.updateStatus(id, 'published');
    await this.invalidateCache(id);

    logger.info({ pollId: id }, 'Poll published');
    return updated;
  }

  async update(
    id: string,
    creatorId: string,
    data: { title?: string; description?: string; isAnonymous?: boolean; expiresAt?: string | null },
  ): Promise<Poll> {
    const poll = await this.getById(id);
    this.assertOwner(poll, creatorId);

    if (poll.status !== 'draft') {
      throw ApiError.badRequest('Only draft polls can be edited', 'POLL_NOT_EDITABLE');
    }

    const updated = await pollsRepository.updateFields(id, {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isAnonymous !== undefined && { isAnonymous: data.isAnonymous }),
      ...(data.expiresAt !== undefined && {
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }),
    });

    await this.invalidateCache(id);
    return updated;
  }

  async delete(id: string, creatorId: string): Promise<void> {
    const poll = await this.getById(id);
    this.assertOwner(poll, creatorId);

    await pollsRepository.delete(id);
    await this.invalidateCache(id);

    logger.info({ pollId: id }, 'Poll deleted');
  }

  isPollExpired(poll: { expiresAt: Date | null }): boolean {
    if (!poll.expiresAt) return false;
    return new Date(poll.expiresAt) < new Date();
  }

  private assertOwner(poll: { id: string; creatorId: string }, requesterId: string): void {
    if (poll.creatorId !== requesterId) {
      throw ApiError.forbidden('You do not own this poll');
    }
  }

  private async invalidateCache(id: string): Promise<void> {
    await redis.del(pollCacheKey(id));
  }
}

export const pollsService = new PollsService();
