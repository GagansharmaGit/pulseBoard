import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/react'
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { usePoll } from '@/hooks/api/use-polls'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { useSubmitResponse as useSubmitHook } from '@/hooks/api/use-responses'

export function RespondPage() {
  const { pollId } = useParams<{ pollId: string }>()
  const { data: pollData, isLoading, error } = usePoll(pollId!)
  const submitResponse = useSubmitHook(pollId!)
  const { toast } = useToast()
  const { isSignedIn, isLoaded } = useAuth()
  
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (isLoading || !isLoaded) return <LoadingSpinner className="h-12 w-12" />

  if (error || !pollData) {
    return (
      <div className="container mx-auto flex h-[80vh] items-center justify-center px-4">
        <Card className="max-w-md text-center shadow-lg">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Poll Unavailable</CardTitle>
            <CardDescription>
              {error?.message || 'This poll does not exist or has been deleted.'}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link to="/">
              <Button>Return Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const { poll, isExpired } = pollData

  if (isSubmitted) {
    return (
      <div className="container mx-auto flex h-[80vh] items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <Card className="max-w-md text-center shadow-lg border-success/20">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">Thank you!</CardTitle>
              <CardDescription className="text-base">
                Your response has been recorded successfully.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-3">
              {poll.status === 'published' && (
                <Link to={`/p/${poll.id}/results`} className="w-full">
                  <Button className="w-full text-base h-11 shadow-md">
                    View Results <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link to="/" className="w-full">
                <Button variant="outline" className="w-full">Create Your Own Poll</Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  const isClosed = poll.status === 'closed' || poll.status === 'published' || isExpired
  const requiresAuth = !poll.isAnonymous && !isSignedIn

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const handleSubmit = () => {
    // Validate required questions
    const missingRequired = poll.questions.filter(
      (q) => q.isRequired && !answers[q.id]
    )

    if (missingRequired.length > 0) {
      toast({
        title: 'Missing answers',
        description: 'Please answer all required questions before submitting.',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      answers: Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      })),
    }

    submitResponse.mutate(payload, {
      onSuccess: () => setIsSubmitted(true),
      onError: (err: any) => {
        toast({
          title: 'Submission failed',
          description: err.response?.data?.error?.message || 'Something went wrong.',
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 animate-slide-up">
      <div className="mb-8 text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">
          {poll.title}
        </h1>
        {poll.description && (
          <p className="text-lg text-muted-foreground">{poll.description}</p>
        )}
      </div>

      {requiresAuth ? (
        <Card className="mb-8 border-warning/50 bg-warning/5 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-6 w-6 text-warning" />
            <p className="font-medium text-warning-foreground">
              This poll requires you to be signed in to vote.
            </p>
          </CardContent>
        </Card>
      ) : isClosed ? (
        <Card className="mb-8 border-destructive/50 bg-destructive/5 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="font-medium text-destructive-foreground">
              This poll is no longer accepting responses.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-6">
        {poll.questions.map((question, index) => (
          <Card key={question.id} className="shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex text-lg font-medium leading-relaxed">
                <span className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                  {index + 1}
                </span>
                <span>
                  {question.text}
                  {question.isRequired && <span className="ml-1 text-destructive">*</span>}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.id
                  return (
                    <Label
                      key={option.id}
                      className={`relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:bg-muted/50'
                      } ${isClosed || requiresAuth ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <span className="font-normal text-base">{option.text}</span>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                        }`}
                      >
                        {isSelected && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                      </div>
                      <input
                        type="radio"
                        name={question.id}
                        className="sr-only"
                        disabled={isClosed || requiresAuth}
                        onChange={() => handleSelect(question.id, option.id)}
                        checked={isSelected}
                      />
                    </Label>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          className="w-full sm:w-auto px-10 shadow-md shadow-primary/20"
          disabled={isClosed || requiresAuth || submitResponse.isPending}
          onClick={handleSubmit}
        >
          {submitResponse.isPending ? 'Submitting...' : 'Submit Response'}
        </Button>
      </div>
    </div>
  )
}
