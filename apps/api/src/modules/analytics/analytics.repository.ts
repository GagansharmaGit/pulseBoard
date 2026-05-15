import { db } from '../../config/database';
import { responseAnswers, responses } from '../../database/schema';
import { eq, sql } from 'drizzle-orm';

export type PollAnalytics = {
  totalResponses: number;
  questionSummaries: Array<{
    questionId: string;
    options: Array<{
      optionId: string;
      count: number;
    }>;
  }>;
};

export class AnalyticsRepository {
  async getPollAnalytics(pollId: string): Promise<PollAnalytics> {
    const totalResult = await db
      .select({ count: sql<number>`cast(count(distinct ${responses.id}) as int)` })
      .from(responses)
      .where(eq(responses.pollId, pollId));

    const totalResponses = totalResult[0]?.count ?? 0;

    const optionCounts = await db
      .select({
        questionId: responseAnswers.questionId,
        optionId: responseAnswers.optionId,
        count: sql<number>`cast(count(${responseAnswers.id}) as int)`,
      })
      .from(responseAnswers)
      .innerJoin(responses, eq(responses.id, responseAnswers.responseId))
      .where(eq(responses.pollId, pollId))
      .groupBy(responseAnswers.questionId, responseAnswers.optionId);

    const questionSummariesMap = new Map<
      string,
      Array<{ optionId: string; count: number }>
    >();

    for (const row of optionCounts) {
      if (!questionSummariesMap.has(row.questionId)) {
        questionSummariesMap.set(row.questionId, []);
      }
      questionSummariesMap.get(row.questionId)!.push({
        optionId: row.optionId,
        count: row.count,
      });
    }

    const questionSummaries = Array.from(questionSummariesMap.entries()).map(
      ([questionId, options]) => ({
        questionId,
        options,
      }),
    );

    return {
      totalResponses,
      questionSummaries,
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
