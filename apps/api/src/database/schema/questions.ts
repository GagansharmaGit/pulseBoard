import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { polls } from './polls';

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  pollId: uuid('poll_id')
    .notNull()
    .references(() => polls.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  orderIndex: integer('order_index').notNull(),
  isRequired: boolean('is_required').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
