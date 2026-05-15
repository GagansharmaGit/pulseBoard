import { useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ArrowLeft, Users, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePoll, usePollAnalytics, pollKeys } from '@/hooks/api/use-polls'
import { useSocket } from '@/hooks/use-socket'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

// Custom Teal color palette for the charts
const COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a']

export function AnalyticsPage() {
  const { pollId } = useParams<{ pollId: string }>()
  const queryClient = useQueryClient()

  const { data: pollData, isLoading: pollLoading, error: pollError } = usePoll(pollId!)
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = usePollAnalytics(pollId!)

  // Invalidate queries when socket event is received
  const handleUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: pollKeys.analytics(pollId!) })
  }, [queryClient, pollId])

  // Hook up real-time updates
  useSocket(pollId!, handleUpdate)

  const isLoading = pollLoading || analyticsLoading
  const error = pollError || analyticsError

  // Prepare chart data mapped to options
  const questionCharts = useMemo(() => {
    if (!pollData || !analytics) return []

    return pollData.poll.questions.map((q) => {
      const summary = analytics.questionSummaries.find((s) => s.questionId === q.id)
      
      const chartData = q.options.map((opt) => {
        const optionCount = summary?.options.find((o) => o.optionId === opt.id)?.count || 0
        return {
          name: opt.text,
          votes: optionCount,
        }
      })

      return {
        question: q,
        chartData,
      }
    })
  }, [pollData, analytics])

  if (isLoading) return <LoadingSpinner className="h-12 w-12" />

  if (error || !pollData || !analytics) {
    return (
      <div className="container mx-auto flex h-[80vh] items-center justify-center px-4">
        <Card className="max-w-md text-center shadow-lg border-destructive/20">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Analytics Unavailable</CardTitle>
            <CardDescription>
              {error?.message || 'You may not have permission to view these results yet.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { poll } = pollData

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 animate-fade-in space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/dashboard" className="flex items-center hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
            <span>•</span>
            <span className="capitalize">{poll.status} Poll</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{poll.title} Results</h1>
          {poll.description && (
            <p className="text-muted-foreground">{poll.description}</p>
          )}
        </div>

        <Card className="sm:w-64 border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/20 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
              <p className="text-3xl font-bold text-foreground">
                {analytics.totalResponses}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {questionCharts.map(({ question, chartData }, index) => (
          <Card key={question.id} className="shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <CardTitle className="text-lg leading-tight">{question.text}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" allowDecimals={false} hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid hsl(var(--border))',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={30} animationDuration={1000}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
