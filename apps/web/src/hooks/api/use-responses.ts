import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '@/lib/api'
import { ApiResponse, SubmitResponseInput } from '@/types/api'
import { pollKeys } from './use-polls'

export function useSubmitResponse(pollId: string) {
  const api = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SubmitResponseInput) => {
      const { data } = await api.post<ApiResponse<{ response: { id: string } }>>(
        `/api/polls/${pollId}/respond`,
        input,
      )
      return data.data.response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pollKeys.detail(pollId) })
      queryClient.invalidateQueries({ queryKey: pollKeys.analytics(pollId) })
    },
  })
}
