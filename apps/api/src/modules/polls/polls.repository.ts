import { db } from '../../config/database';
import { polls, questions, options } from '../../database/schema';
import { eq, desc, asc, count, sql } from 'drizzle-orm';
import { Poll, NewPoll } from '../../database/schema/polls';
import { responses } from '../../database/schema/responses';

type CreatePollData = {
  title: string;
  description?: string | null;
  isAnonymous: boolean;
  expiresAt?: string | null;
  questions: Array<{
    text: string;
    orderIndex: number;
    isRequired: boolean;
    options: Array<{ text: string; orderIndex: number }>;
  }>;
};

export type PollWithDetails = Awaited<ReturnType<PollsRepository['findById']>>;
export type PollSummary = Awaited<ReturnType<PollsRepository['findByCreatorId']>>[number];

export class PollsRepository {
  async create(creatorId: string, input: CreatePollData): Promise<Poll> {
    return db.transaction(async (tx) => {
      const [poll] = await tx
        .insert(polls)
        .values({
          creatorId,
          title: input.title,
          description: input.description ?? null,
          isAnonymous: input.isAnonymous,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          status: 'draft',
        })
        .returning();

      for (const q of input.questions) {
        const [question] = await tx
          .insert(questions)
          .values({
            pollId: poll.id,
            text: q.text,
            orderIndex: q.orderIndex,
            isRequired: q.isRequired,
          })
          .returning();

        await tx.insert(options).values(
          q.options.map((opt) => ({
            questionId: question.id,
            text: opt.text,
            orderIndex: opt.orderIndex,
          })),
        );
      }

      return poll;
    });
  }

  async findById(id: string) {
    return db.query.polls.findFirst({
      where: eq(polls.id, id),
      with: {
        questions: {
          orderBy: asc(questions.orderIndex),
          with: {
            options: {
              orderBy: asc(options.orderIndex),
            },
          },
        },
      },
    });
  }

  async findByCreatorId(creatorId: string) {
    return db
      .select({
        id: polls.id,
        title: polls.title,
        description: polls.description,
        isAnonymous: polls.isAnonymous,
        expiresAt: polls.expiresAt,
        status: polls.status,
        createdAt: polls.createdAt,
        updatedAt: polls.updatedAt,
        questionCount: count(questions.id),
        responseCount: sql<number>`cast(count(distinct ${responses.id}) as int)`,
      })
      .from(polls)
      .leftJoin(questions, eq(questions.pollId, polls.id))
      .leftJoin(responses, eq(responses.pollId, polls.id))
      .where(eq(polls.creatorId, creatorId))
      .groupBy(polls.id)
      .orderBy(desc(polls.createdAt));
  }

  async updateStatus(id: string, status: Poll['status']): Promise<Poll> {
    const [updated] = await db
      .update(polls)
      .set({ status, updatedAt: new Date() })
      .where(eq(polls.id, id))
      .returning();
    return updated;
  }

  async updateFields(
    id: string,
    data: Partial<Pick<NewPoll, 'title' | 'description' | 'isAnonymous' | 'expiresAt'>>,
  ): Promise<Poll> {
    const [updated] = await db
      .update(polls)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(polls.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.delete(polls).where(eq(polls.id, id));
  }
}

export const pollsRepository = new PollsRepository();
