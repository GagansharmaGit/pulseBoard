export type PollStatus = 'draft' | 'active' | 'closed' | 'published';

export interface PollOption {
  id: string;
  text: string;
  orderIndex: number;
}

export interface PollQuestion {
  id: string;
  text: string;
  orderIndex: number;
  isRequired: boolean;
  options: PollOption[];
}

export interface Poll {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  isAnonymous: boolean;
  expiresAt: string | null;
  status: PollStatus;
  createdAt: string;
  updatedAt: string;
  questions: PollQuestion[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  requestId?: string;
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  totalAnswers: number;
  options: Array<{
    optionId: string;
    optionText: string;
    count: number;
    percentage: number;
  }>;
}

export interface PollAnalytics {
  pollId: string;
  totalResponses: number;
  completionRate: number;
  questions: QuestionAnalytics[];
}
