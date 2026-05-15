import { z } from 'zod';

export const createOptionSchema = z.object({
  text: z.string().min(1, 'Option text is required').max(500),
  orderIndex: z.number().int().min(0),
});

export const createQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required').max(1000),
  orderIndex: z.number().int().min(0),
  isRequired: z.boolean().default(true),
  options: z
    .array(createOptionSchema)
    .min(2, 'Each question must have at least 2 options')
    .max(10),
});

export const createPollSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  isAnonymous: z.boolean().default(false),
  expiresAt: z.string().datetime().optional().nullable(),
  questions: z
    .array(createQuestionSchema)
    .min(1, 'Poll must have at least one question')
    .max(50),
});

export const submitResponseSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        optionId: z.string().uuid(),
      }),
    )
    .min(1),
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type CreateOptionInput = z.infer<typeof createOptionSchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
