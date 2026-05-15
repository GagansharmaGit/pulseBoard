import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { polls } from './polls';
import { users } from './users';
import { questions } from './questions';
import { options } from './options';

export const responses = pgTable('responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  pollId: uuid('poll_id')
    .notNull()
    .references(() => polls.id, { onDelete: 'cascade' }),
  respondentId: text('respondent_id').references(() => users.id, { onDelete: 'set null' }),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

export const responseAnswers = pgTable('response_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  responseId: uuid('response_id')
    .notNull()
    .references(() => responses.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  optionId: uuid('option_id')
    .notNull()
    .references(() => options.id, { onDelete: 'cascade' }),
});

export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;
export type ResponseAnswer = typeof responseAnswers.$inferSelect;
export type NewResponseAnswer = typeof responseAnswers.$inferInsert;
