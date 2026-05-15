import { Request, Response } from 'express';
import { pollsService } from './polls.service';
import { usersService } from '../users/users.service';
import { z } from 'zod';

const createOptionSchema = z.object({
  text: z.string().min(1).max(500),
  orderIndex: z.number().int().min(0),
});

const createQuestionSchema = z.object({
  text: z.string().min(1).max(1000),
  orderIndex: z.number().int().min(0),
  isRequired: z.boolean().default(true),
  options: z.array(createOptionSchema).min(2).max(10),
});

const createPollSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  isAnonymous: z.boolean().default(false),
  expiresAt: z.string().datetime().optional().nullable(),
  questions: z.array(createQuestionSchema).min(1).max(50),
});

const updatePollSchema = createPollSchema.partial().omit({ questions: true });

export class PollsController {
  async create(req: Request, res: Response): Promise<void> {
    await usersService.getOrSync(req.userId!);
    const input = createPollSchema.parse(req.body);
    const poll = await pollsService.create(req.userId!, input);

    res.status(201).json({ success: true, data: { poll }, requestId: req.requestId });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const poll = await pollsService.getPublicPoll(req.params.id);
    const isExpired = pollsService.isPollExpired(poll);

    res.json({ success: true, data: { poll, isExpired }, requestId: req.requestId });
  }

  async getMyPolls(req: Request, res: Response): Promise<void> {
    const polls = await pollsService.getMyPolls(req.userId!);
    res.json({ success: true, data: { polls }, requestId: req.requestId });
  }

  async update(req: Request, res: Response): Promise<void> {
    const input = updatePollSchema.parse(req.body);
    const poll = await pollsService.update(req.params.id, req.userId!, input);
    res.json({ success: true, data: { poll }, requestId: req.requestId });
  }

  async activate(req: Request, res: Response): Promise<void> {
    const poll = await pollsService.activate(req.params.id, req.userId!);
    res.json({ success: true, data: { poll }, requestId: req.requestId });
  }

  async close(req: Request, res: Response): Promise<void> {
    const poll = await pollsService.close(req.params.id, req.userId!);
    res.json({ success: true, data: { poll }, requestId: req.requestId });
  }

  async publish(req: Request, res: Response): Promise<void> {
    const poll = await pollsService.publish(req.params.id, req.userId!);
    res.json({ success: true, data: { poll }, requestId: req.requestId });
  }

  async delete(req: Request, res: Response): Promise<void> {
    await pollsService.delete(req.params.id, req.userId!);
    res.status(204).send();
  }
}

export const pollsController = new PollsController();
