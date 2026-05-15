import { pgTable, text, uuid, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const pollStatusEnum = pgEnum('poll_status', ['draft', 'active', 'closed', 'published']);

export const polls = pgTable('polls', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: text('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  expiresAt: timestamp('expires_at'),
  status: pollStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Poll = typeof polls.$inferSelect;
export type NewPoll = typeof polls.$inferInsert;
