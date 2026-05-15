import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '@/lib/api'
import {
  ApiResponse,
  PollWithDetails,
  PollSummary,
  CreatePollInput,
  Poll,
  Analytics,
} from '@/types/api'

export const pollKeys = {
  all: ['polls'] as const,
  lists: () => [...pollKeys.all, 'list'] as const,
  list: (filters: string) => [...pollKeys.lists(), { filters }] as const,
  details: () => [...pollKeys.all, 'detail'] as const,
  detail: (id: string) => [...pollKeys.details(), id] as const,
  analytics: (id: string) => [...pollKeys.all, 'analytics', id] as const,
}

export function useMyPolls() {
  const api = useApiClient()
  return useQuery({
    queryKey: pollKeys.lists(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ polls: PollSummary[] }>>('/api/polls/me')
      return data.data.polls
    },
  })
}

export function usePoll(id: string) {
  const api = useApiClient()
  return useQuery({
    queryKey: pollKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ poll: PollWithDetails; isExpired: boolean }>>(
        `/api/polls/${id}`,
      )
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreatePoll() {
  const api = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePollInput) => {
      const { data } = await api.post<ApiResponse<{ poll: Poll }>>('/api/polls', input)
      return data.data.poll
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() })
    },
  })
}

export function useUpdatePollStatus() {
  const api = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'activate' | 'close' | 'publish' }) => {
      const { data } = await api.patch<ApiResponse<{ poll: Poll }>>(`/api/polls/${id}/${status}`)
      return data.data.poll
    },
    onSuccess: (updatedPoll) => {
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pollKeys.detail(updatedPoll.id) })
    },
  })
}

export function useDeletePoll() {
  const api = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/polls/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() })
    },
  })
}

export function usePollAnalytics(id: string) {
  const api = useApiClient()
  return useQuery({
    queryKey: pollKeys.analytics(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ analytics: Analytics }>>(
        `/api/polls/${id}/analytics`,
      )
      return data.data.analytics
    },
    enabled: !!id,
  })
}
