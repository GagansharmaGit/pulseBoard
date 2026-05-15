import { relations } from 'drizzle-orm';
import { users } from './users';
import { polls } from './polls';
import { questions } from './questions';
import { options } from './options';
import { responses, responseAnswers } from './responses';

export const usersRelations = relations(users, ({ many }) => ({
  polls: many(polls),
  responses: many(responses),
}));

export const pollsRelations = relations(polls, ({ one, many }) => ({
  creator: one(users, { fields: [polls.creatorId], references: [users.id] }),
  questions: many(questions),
  responses: many(responses),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  poll: one(polls, { fields: [questions.pollId], references: [polls.id] }),
  options: many(options),
  responseAnswers: many(responseAnswers),
}));

export const optionsRelations = relations(options, ({ one, many }) => ({
  question: one(questions, { fields: [options.questionId], references: [questions.id] }),
  responseAnswers: many(responseAnswers),
}));

export const responsesRelations = relations(responses, ({ one, many }) => ({
  poll: one(polls, { fields: [responses.pollId], references: [polls.id] }),
  respondent: one(users, { fields: [responses.respondentId], references: [users.id] }),
  answers: many(responseAnswers),
}));

export const responseAnswersRelations = relations(responseAnswers, ({ one }) => ({
  response: one(responses, { fields: [responseAnswers.responseId], references: [responses.id] }),
  question: one(questions, { fields: [responseAnswers.questionId], references: [questions.id] }),
  option: one(options, { fields: [responseAnswers.optionId], references: [options.id] }),
}));
