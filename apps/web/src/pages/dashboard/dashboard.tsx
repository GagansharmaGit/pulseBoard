import { Link } from 'react-router-dom'
import { Plus, MoreVertical, BarChart2, CheckCircle2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { useMyPolls, useDeletePoll, useUpdatePollStatus } from '@/hooks/api/use-polls'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import { PollSummary } from '@/types/api'

export function DashboardPage() {
  const { data: polls, isLoading } = useMyPolls()

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your polls and view results.</p>
        </div>
        <Link to="/dashboard/polls/new">
          <Button className="w-full sm:w-auto shadow-md shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Create New Poll
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : polls?.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {polls?.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-card/50">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
        <BarChart2 className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold">No polls yet</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        You haven't created any polls. Create your first poll to start gathering feedback from your audience.
      </p>
      <Link to="/dashboard/polls/new" className="mt-6">
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Poll
        </Button>
      </Link>
    </div>
  )
}

function PollCard({ poll }: { poll: PollSummary }) {
  const { toast } = useToast()
  const deletePoll = useDeletePoll()
  const updateStatus = useUpdatePollStatus()

  const isDraft = poll.status === 'draft'
  const isActive = poll.status === 'active'
  const isClosed = poll.status === 'closed'

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${poll.id}`)
    toast({ title: 'Link copied to clipboard' })
  }

  const navigate = useNavigate()

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      deletePoll.mutate(poll.id, {
        onSuccess: () => toast({ title: 'Poll deleted successfully' }),
      })
    }
  }

  return (
    <Card className="flex flex-col shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1 text-lg">{poll.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/p/${poll.id}`)}>
                View Poll
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/p/${poll.id}/results`)}>
                View Results
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={copyLink}>Copy Link</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                Delete Poll
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>{poll.questionCount} {poll.questionCount === 1 ? 'question' : 'questions'}</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" />
            <span>{poll.responseCount} {poll.responseCount === 1 ? 'response' : 'responses'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-3">
        <StatusBadge status={poll.status} />
        
        {isDraft && (
          <Button
            size="sm"
            variant="outline"
            disabled={updateStatus.isPending || poll.questionCount === 0}
            onClick={() => updateStatus.mutate({ id: poll.id, status: 'activate' })}
          >
            Activate
          </Button>
        )}
        
        {isActive && (
          <Button
            size="sm"
            variant="outline"
            disabled={updateStatus.isPending}
            onClick={() => updateStatus.mutate({ id: poll.id, status: 'close' })}
          >
            Close
          </Button>
        )}

        {isClosed && (
          <Button
            size="sm"
            variant="outline"
            disabled={updateStatus.isPending}
            onClick={() => updateStatus.mutate({ id: poll.id, status: 'publish' })}
          >
            Publish Results
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function StatusBadge({ status }: { status: PollSummary['status'] }) {
  const variants = {
    draft: 'bg-muted text-muted-foreground',
    active: 'bg-success/15 text-success hover:bg-success/20',
    closed: 'bg-warning/15 text-warning hover:bg-warning/20',
    published: 'bg-primary/15 text-primary hover:bg-primary/20',
  }

  return (
    <Badge variant="secondary" className={`${variants[status]} border-none capitalize font-medium`}>
      {status}
    </Badge>
  )
}
