import { responsesRepository } from './responses.repository';
import { pollsService } from '../polls/polls.service';
import { ApiError } from '../../common/middleware/error-handler.middleware';
import { applyResponseRateLimit } from '../../common/middleware/rate-limiter.middleware';
import { getSocketServer } from '../../config/socket';
import { logger } from '../../config/logger';
import { Response as ResponseRow } from '../../database/schema/responses';

type AnswerInput = {
  questionId: string;
  optionId: string;
};

type SubmitInput = {
  answers: AnswerInput[];
};

export class ResponsesService {
  async submit(
    pollId: string,
    userId: string | undefined,
    input: SubmitInput,
    clientIp: string,
  ): Promise<ResponseRow> {
    const rateLimitKey = userId ?? clientIp;
    await applyResponseRateLimit(rateLimitKey, !!userId);

    const poll = await pollsService.getById(pollId);

    if (poll.status === 'draft') {
      throw ApiError.notFound('Poll not found');
    }

    if (poll.status === 'closed' || poll.status === 'published') {
      throw ApiError.badRequest('This poll is no longer accepting responses', 'POLL_CLOSED');
    }

    if (pollsService.isPollExpired(poll)) {
      throw ApiError.badRequest('This poll has expired', 'POLL_EXPIRED');
    }

    if (!poll.isAnonymous && !userId) {
      throw ApiError.unauthorized('This poll requires you to be signed in to respond');
    }

    if (userId) {
      const existing = await responsesRepository.findByRespondentAndPoll(userId, pollId);
      if (existing) {
        throw ApiError.conflict('You have already responded to this poll', 'ALREADY_RESPONDED');
      }
    }

    this.validateAnswers(poll, input.answers);

    const response = await responsesRepository.create(
      pollId,
      userId ?? null,
      input.answers,
    );

    // Broadcast to everyone viewing the analytics for this poll
    getSocketServer().to(`poll:${pollId}`).emit('poll_updated', {
      pollId,
      responseId: response.id,
    });

    logger.info(
      { pollId, responseId: response.id, isAnonymous: !userId },
      'Poll response submitted',
    );

    return response;
  }

  private validateAnswers(
    poll: {
      questions: Array<{
        id: string;
        isRequired: boolean;
        options: Array<{ id: string }>;
      }>;
    },
    answers: AnswerInput[],
  ): void {
    const answerMap = new Map<string, string>(answers.map((a) => [a.questionId, a.optionId]));

    for (const question of poll.questions) {
      const answeredOptionId = answerMap.get(question.id);

      if (question.isRequired && !answeredOptionId) {
        throw ApiError.badRequest(
          `Question is required but was not answered`,
          'REQUIRED_QUESTION_MISSING',
        );
      }

      if (answeredOptionId) {
        const validOption = question.options.find((o) => o.id === answeredOptionId);
        if (!validOption) {
          throw ApiError.badRequest(
            'Answer references an option that does not belong to the question',
            'INVALID_OPTION',
          );
        }
      }
    }

    for (const answer of answers) {
      const question = poll.questions.find((q) => q.id === answer.questionId);
      if (!question) {
        throw ApiError.badRequest(
          'Answer references a question that does not belong to this poll',
          'INVALID_QUESTION',
        );
      }
    }
  }
}

export const responsesService = new ResponsesService();
