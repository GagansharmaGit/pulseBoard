import { useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Users, AlertCircle, Share2, QrCode, BarChart2, CheckCircle2, Clock, Hash } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { usePoll, usePollAnalytics, pollKeys } from '@/hooks/api/use-polls'
import { useSocket } from '@/hooks/use-socket'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { useToast } from '@/hooks/use-toast'

// Accent colors for each option bar
const OPTION_COLORS = [
  { bar: 'bg-primary',          text: 'text-primary' },
  { bar: 'bg-sky-500',          text: 'text-sky-400' },
  { bar: 'bg-amber-500',        text: 'text-amber-400' },
  { bar: 'bg-violet-500',       text: 'text-violet-400' },
  { bar: 'bg-rose-500',         text: 'text-rose-400' },
]

export function AnalyticsPage() {
  const { pollId } = useParams<{ pollId: string }>()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: pollData, isLoading: pollLoading, error: pollError } = usePoll(pollId!)
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = usePollAnalytics(pollId!)

  const handleUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: pollKeys.analytics(pollId!) })
  }, [queryClient, pollId])

  useSocket(pollId!, handleUpdate)

  const isLoading = pollLoading || analyticsLoading
  const error = pollError || analyticsError

  // Build per-question chart data
  const questionCharts = useMemo(() => {
    if (!pollData || !analytics) return []
    return pollData.poll.questions.map((q) => {
      const summary = analytics.questionSummaries.find((s) => s.questionId === q.id)
      const optionData = q.options.map((opt) => {
        const count = summary?.options.find((o) => o.optionId === opt.id)?.count ?? 0
        return { name: opt.text, votes: count }
      })
      const total = optionData.reduce((s, o) => s + o.votes, 0)
      return { question: q, optionData, total }
    })
  }, [pollData, analytics])

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner className="h-10 w-10" />
      </div>
    )
  }

  // ── Error ──
  if (error || !pollData || !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-white">Analytics Unavailable</h2>
          <p className="text-sm text-muted-foreground">
            {(error as any)?.message || 'You may not have permission to view these results yet.'}
          </p>
          <Link to="/dashboard">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { poll } = pollData
  const isActive = poll.status === 'active'

  const statusCfg = {
    active:    { label: 'Live',      cls: 'bg-primary/10 text-primary border-primary/20',      dot: 'bg-primary animate-pulse' },
    closed:    { label: 'Closed',    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
    published: { label: 'Published', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20',       dot: 'bg-sky-400' },
    draft:     { label: 'Draft',     cls: 'bg-white/8 text-muted-foreground border-white/10',   dot: 'bg-zinc-500' },
  }[poll.status]

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${poll.id}`)
    toast({ title: 'Link copied!' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header bar ── */}
      <div className="border-b border-white/6 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex h-14 items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-muted-foreground hover:text-white hover:bg-white/6"
              onClick={copyLink}
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5" /> Copy Link
            </Button>

            <Dialog>
            <DialogTrigger
              render={
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-muted-foreground hover:text-white hover:bg-white/6">
                  <QrCode className="mr-1.5 h-3.5 w-3.5" /> QR Code
                </Button>
              }
            />
              <DialogContent className="sm:max-w-sm flex flex-col items-center p-8">
                <DialogHeader className="text-center mb-4">
                  <DialogTitle>Share Poll</DialogTitle>
                  <DialogDescription>Scan to participate</DialogDescription>
                </DialogHeader>
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeCanvas value={`${window.location.origin}/p/${poll.id}`} size={200} level="H" includeMargin />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8 animate-fade-in">

        {/* ── Poll title + status ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusCfg.cls}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
            {isActive && (
              <span className="text-xs text-primary font-medium">
                · Updating live
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            {poll.title}
          </h1>
          {poll.description && (
            <p className="text-sm text-muted-foreground max-w-2xl">{poll.description}</p>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Total Responses"
            value={analytics.totalResponses}
            accent="text-primary bg-primary/10"
            delay={0}
          />
          <StatCard
            icon={<Hash className="h-4 w-4" />}
            label="Questions"
            value={pollData.poll.questions.length}
            accent="text-sky-400 bg-sky-500/10"
            delay={0.05}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Status"
            value={statusCfg.label}
            accent="text-amber-400 bg-amber-500/10"
            delay={0.1}
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label={poll.expiresAt ? 'Expires' : 'Created'}
            value={
              poll.expiresAt
                ? formatDistanceToNow(new Date(poll.expiresAt), { addSuffix: true })
                : formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })
            }
            accent="text-violet-400 bg-violet-500/10"
            delay={0.15}
            small
          />
        </div>

        {/* ── Question cards ── */}
        {questionCharts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/40 py-20 text-center">
            <BarChart2 className="h-10 w-10 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No questions found in this poll.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {questionCharts.map(({ question, optionData, total }, qi) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: qi * 0.06 }}
                className="rounded-xl border border-white/8 bg-card overflow-hidden"
              >
                {/* Question header */}
                <div className="flex items-start gap-3 border-b border-white/6 px-5 py-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                    {qi + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white leading-snug">{question.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {total} {total === 1 ? 'response' : 'responses'} · {question.isRequired ? 'Required' : 'Optional'}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="p-5 space-y-4">
                  {optionData.map((opt, oi) => {
                    const pct = total === 0 ? 0 : Math.round((opt.votes / total) * 100)
                    const color = OPTION_COLORS[oi % OPTION_COLORS.length]
                    const isTop = total > 0 && opt.votes === Math.max(...optionData.map(o => o.votes))

                    return (
                      <div key={oi} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            {isTop && total > 0 && (
                              <span className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1 py-0.5">
                                TOP
                              </span>
                            )}
                            <span className="text-sm text-white truncate">{opt.name}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-muted-foreground">{opt.votes} votes</span>
                            <span className={`text-sm font-bold tabular-nums ${color.text}`}>{pct}%</span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="h-2 w-full rounded-full bg-white/6 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${color.bar}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: qi * 0.06 + oi * 0.05, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    )
                  })}

                  {total === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No responses yet for this question.</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  accent,
  delay,
  small,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  accent: string
  delay: number
  small?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border border-white/8 bg-card p-4 flex flex-col gap-2"
    >
      <div className={`inline-flex items-center justify-center rounded-lg p-2 w-fit ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`font-black tracking-tight text-white ${small ? 'text-sm' : 'text-2xl'}`}>{value}</p>
      </div>
    </motion.div>
  )
}
