import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import {
  Plus, BarChart2, CheckCircle2, Clock, Share2,
  QrCode, ExternalLink, Trash2, TrendingUp,
  Activity, FileText, Zap,
} from 'lucide-react'
import { formatDistanceToNow, format, subDays, isSameDay } from 'date-fns'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { QRCodeCanvas } from 'qrcode.react'
import { useMyPolls, useDeletePoll, useUpdatePollStatus } from '@/hooks/api/use-polls'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import { PollSummary } from '@/types/api'

// ── Stat Card ─────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
  delay = 0,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  accent: string
  sub?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="stat-card group hover:-translate-y-0.5 transition-transform duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={`rounded-lg p-2 ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-black tracking-tight text-white">{value}</span>
        {sub && <span className="mb-0.5 text-xs text-muted-foreground">{sub}</span>}
      </div>
    </motion.div>
  )
}

// ── Custom Tooltip ─────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/10 bg-card px-3 py-2 text-sm shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-white">{payload[0].value} polls created</p>
    </div>
  )
}

// ── Main Dashboard Page ────────────────────────────────────
export function DashboardPage() {
  const { data: polls, isLoading } = useMyPolls()
  const { user } = useUser()

  // Stats derived from real data
  const stats = useMemo(() => {
    if (!polls) return { total: 0, active: 0, responses: 0, draft: 0 }
    return {
      total: polls.length,
      active: polls.filter(p => p.status === 'active').length,
      responses: polls.reduce((s, p) => s + p.responseCount, 0),
      draft: polls.filter(p => p.status === 'draft').length,
    }
  }, [polls])

  // Chart data — polls created per day (last 7 days) from real createdAt timestamps
  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i))
    return days.map(day => ({
      date: format(day, 'MMM d'),
      count: (polls ?? []).filter(p => isSameDay(new Date(p.createdAt), day)).length,
    }))
  }, [polls])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.firstName ?? 'there'

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 animate-fade-in min-h-full">

      {/* ── Top bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {greeting}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.active > 0
              ? `You have ${stats.active} active poll${stats.active > 1 ? 's' : ''} collecting responses right now.`
              : 'Create a poll to start collecting responses.'}
          </p>
        </div>
        <Link to="/dashboard/polls/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(0,220,130,0.25)] transition-all hover:shadow-[0_0_28px_rgba(0,220,130,0.35)]">
            <Plus className="mr-2 h-4 w-4" /> New Poll
          </Button>
        </Link>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Polls"    value={stats.total}     icon={FileText}     accent="bg-primary/10 text-primary"       delay={0}    />
        <StatCard label="Active Polls"   value={stats.active}    icon={Activity}     accent="bg-emerald-500/10 text-emerald-400" delay={0.05} sub={stats.active > 0 ? 'live' : undefined} />
        <StatCard label="Total Responses" value={stats.responses} icon={TrendingUp}  accent="bg-sky-500/10 text-sky-400"        delay={0.1}  />
        <StatCard label="Drafts"         value={stats.draft}     icon={Zap}          accent="bg-amber-500/10 text-amber-400"    delay={0.15} />
      </div>

      {/* ── Activity Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-xl border border-white/8 bg-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-white">Poll Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Polls created — last 7 days</p>
          </div>
          <span className="text-xs text-muted-foreground bg-white/5 border border-white/8 px-2 py-1 rounded-md">7 days</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#00DC82" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#00DC82" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#00DC82"
              strokeWidth={2}
              fill="url(#areaGrad)"
              dot={{ fill: '#00DC82', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#00DC82', stroke: '#fff', strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Polls Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent Polls</h2>
          <Link to="/dashboard/polls" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><LoadingSpinner /></div>
        ) : polls?.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {polls?.slice(0, 3).map((poll, i) => (
              <PollCard key={poll.id} poll={poll} delay={i * 0.04} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── My Polls Page ──────────────────────────────────────────
export function PollsPage() {
  const { data: polls, isLoading } = useMyPolls()

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 animate-fade-in min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">My Polls</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {polls ? `${polls.length} poll${polls.length !== 1 ? 's' : ''} total` : 'Loading…'}
          </p>
        </div>
        <Link to="/dashboard/polls/new">
          <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(0,220,130,0.25)]">
            <Plus className="mr-2 h-4 w-4" /> New Poll
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24"><LoadingSpinner /></div>
      ) : polls?.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {polls?.map((poll, i) => (
            <PollCard key={poll.id} poll={poll} delay={i * 0.04} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/40 p-16 text-center"
    >
      <div className="relative mb-6">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BarChart2 className="h-8 w-8 text-primary" />
        </div>
        <div className="absolute -inset-2 rounded-3xl bg-primary/5 blur-xl -z-10" />
      </div>
      <h3 className="text-lg font-semibold text-white">No polls yet</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        Create your first poll and start collecting real-time feedback from your audience.
      </p>
      <Link to="/dashboard/polls/new" className="mt-6">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Create Poll
        </Button>
      </Link>
    </motion.div>
  )
}

// ── Poll Card ──────────────────────────────────────────────
function PollCard({ poll, delay }: { poll: PollSummary; delay: number }) {
  const { toast } = useToast()
  const deletePoll = useDeletePoll()
  const updateStatus = useUpdatePollStatus()
  const navigate = useNavigate()

  const isDraft     = poll.status === 'draft'
  const isActive    = poll.status === 'active'
  const isClosed    = poll.status === 'closed'
  const isPublished = poll.status === 'published'

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${poll.id}`)
    toast({ title: 'Link copied!' })
  }

  const handleDelete = () => {
    if (confirm('Delete this poll? This cannot be undone.')) {
      deletePoll.mutate(poll.id, {
        onSuccess: () => toast({ title: 'Poll deleted' }),
      })
    }
  }

  // Progress bar — cap at 100 for display
  const maxForDisplay = 100
  const progressPct = Math.min((poll.responseCount / maxForDisplay) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="group flex flex-col rounded-xl border border-white/8 bg-card hover:border-white/15 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* Card top */}
      <div className="flex flex-col gap-3 p-5">
        {/* Title + status row */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">{poll.title}</h3>
          </div>
          <StatusBadge status={poll.status} />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {poll.questionCount} {poll.questionCount === 1 ? 'question' : 'questions'}
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart2 className="h-3.5 w-3.5" />
            {poll.responseCount} {poll.responseCount === 1 ? 'response' : 'responses'}
          </span>
        </div>

        {/* Response progress bar */}
        <div>
          <div className="h-1 rounded-full bg-white/6 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Expiry / created */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {poll.expiresAt
            ? `Expires ${formatDistanceToNow(new Date(poll.expiresAt), { addSuffix: true })}`
            : `Created ${formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}`}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto border-t border-white/6 px-4 py-3 flex items-center gap-1.5 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 text-xs text-muted-foreground hover:text-white hover:bg-white/6"
          onClick={() => navigate(`/p/${poll.id}`)}
        >
          <ExternalLink className="mr-1.5 h-3 w-3" /> View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 text-xs text-muted-foreground hover:text-white hover:bg-white/6"
          onClick={() => navigate(`/p/${poll.id}/results`)}
        >
          <BarChart2 className="mr-1.5 h-3 w-3" /> Results
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-muted-foreground hover:text-white hover:bg-white/6">
              <QrCode className="mr-1.5 h-3 w-3" /> QR
            </Button>
          </DialogTrigger>
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

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2.5 text-xs text-muted-foreground hover:text-white hover:bg-white/6"
          onClick={copyLink}
        >
          <Share2 className="mr-1.5 h-3 w-3" /> Copy
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
          onClick={handleDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Primary action footer */}
      {(isDraft || isActive || isClosed) && (
        <div className="px-4 pb-4">
          {isDraft && (
            <Button
              size="sm"
              className="w-full h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_rgba(0,220,130,0.2)]"
              disabled={updateStatus.isPending || poll.questionCount === 0}
              onClick={() => updateStatus.mutate({ id: poll.id, status: 'activate' })}
            >
              Activate Poll
            </Button>
          )}
          {isActive && (
            <Button
              size="sm"
              variant="destructive"
              className="w-full h-8 text-xs font-semibold"
              disabled={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: poll.id, status: 'close' })}
            >
              Close Poll
            </Button>
          )}
          {isClosed && (
            <Button
              size="sm"
              className="w-full h-8 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              disabled={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: poll.id, status: 'publish' })}
            >
              Publish Results
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ── Status Badge ───────────────────────────────────────────
function StatusBadge({ status }: { status: PollSummary['status'] }) {
  const cfg = {
    draft:     { cls: 'bg-white/8 text-muted-foreground',              dot: 'bg-zinc-500',   label: 'Draft' },
    active:    { cls: 'bg-primary/10 text-primary border-primary/20',  dot: 'bg-primary pulse-glow', label: 'Live' },
    closed:    { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400', label: 'Closed' },
    published: { cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20',  dot: 'bg-sky-400',    label: 'Published' },
  }[status]

  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
