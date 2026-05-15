import { Request, Response } from 'express';
import { responsesService } from './responses.service';
import { z } from 'zod';

const submitResponseSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid('Invalid question ID'),
        optionId: z.string().uuid('Invalid option ID'),
      }),
    )
    .min(1, 'At least one answer is required'),
});

export class ResponsesController {
  async submit(req: Request, res: Response): Promise<void> {
    const input = submitResponseSchema.parse(req.body);
    const clientIp = (req.ip ?? req.socket.remoteAddress ?? 'unknown').replace('::ffff:', '');

    const response = await responsesService.submit(
      req.params.pollId,
      req.userId,
      input,
      clientIp,
    );

    res.status(201).json({
      success: true,
      data: { response },
      requestId: req.requestId,
    });
  }
}

export const responsesController = new ResponsesController();
