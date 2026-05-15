import { pgTable, uuid, text, integer } from 'drizzle-orm/pg-core';
import { questions } from './questions';

export const options = pgTable('options', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  orderIndex: integer('order_index').notNull(),
});

export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;
