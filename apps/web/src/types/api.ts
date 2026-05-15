export type PollStatus = 'draft' | 'active' | 'closed' | 'published'

export type Option = {
  id: string
  questionId: string
  text: string
  orderIndex: number
}

export type Question = {
  id: string
  pollId: string
  text: string
  orderIndex: number
  isRequired: boolean
  options: Option[]
}

export type Poll = {
  id: string
  creatorId: string
  title: string
  description: string | null
  isAnonymous: boolean
  expiresAt: string | null
  status: PollStatus
  createdAt: string
  updatedAt: string
}

export type PollWithDetails = Poll & {
  questions: Question[]
}

export type PollSummary = Poll & {
  questionCount: number
  responseCount: number
}

export type CreatePollInput = {
  title: string
  description?: string
  isAnonymous: boolean
  expiresAt?: string | null
  questions: Array<{
    text: string
    orderIndex: number
    isRequired: boolean
    options: Array<{
      text: string
      orderIndex: number
    }>
  }>
}

export type SubmitResponseInput = {
  answers: Array<{
    questionId: string
    optionId: string
  }>
}

export type Analytics = {
  totalResponses: number
  questionSummaries: Array<{
    questionId: string
    options: Array<{
      optionId: string
      count: number
    }>
  }>
}

export type ApiResponse<T> = {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
  }
  requestId: string
}
