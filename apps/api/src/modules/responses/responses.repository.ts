import { db } from '../../config/database';
import { responses, responseAnswers } from '../../database/schema';
import { and, eq } from 'drizzle-orm';
import { Response as ResponseRow } from '../../database/schema/responses';

type AnswerInput = {
  questionId: string;
  optionId: string;
};

export class ResponsesRepository {
  async findByRespondentAndPoll(
    respondentId: string,
    pollId: string,
  ): Promise<ResponseRow | undefined> {
    const result = await db
      .select()
      .from(responses)
      .where(and(eq(responses.respondentId, respondentId), eq(responses.pollId, pollId)))
      .limit(1);

    return result[0];
  }

  async create(
    pollId: string,
    respondentId: string | null,
    answers: AnswerInput[],
  ): Promise<ResponseRow> {
    return db.transaction(async (tx) => {
      const [response] = await tx
        .insert(responses)
        .values({ pollId, respondentId })
        .returning();

      await tx.insert(responseAnswers).values(
        answers.map((a) => ({
          responseId: response.id,
          questionId: a.questionId,
          optionId: a.optionId,
        })),
      );

      return response;
    });
  }

  async countByPoll(pollId: string): Promise<number> {
    const result = await db
      .select({ count: db.$count(responses, eq(responses.pollId, pollId)) })
      .from(responses)
      .where(eq(responses.pollId, pollId));

    return Number(result[0]?.count ?? 0);
  }
}

export const responsesRepository = new ResponsesRepository();
