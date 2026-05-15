import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ArrowLeft, GripVertical, Clock, Shield, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useCreatePoll } from '@/hooks/api/use-polls'
import { useToast } from '@/hooks/use-toast'

const optionSchema = z.object({
  text: z.string().min(1, 'Option text is required').max(500),
})

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required').max(1000),
  isRequired: z.boolean(),
  options: z.array(optionSchema).min(2, 'At least 2 options required'),
})

const createPollSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  isAnonymous: z.boolean(),
  expiresAt: z.string().optional().nullable(),
  questions: z.array(questionSchema).min(1, 'At least 1 question required'),
})

type FormValues = z.infer<typeof createPollSchema>

export function CreatePollPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createPoll = useCreatePoll()

  const form = useForm<FormValues>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      title: '',
      description: '',
      isAnonymous: false,
      expiresAt: null,
      questions: [
        {
          text: '',
          isRequired: true,
          options: [{ text: '' }, { text: '' }],
        },
      ],
    },
  })

  const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: 'questions',
  })

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      questions: data.questions.map((q, qIndex) => ({
        ...q,
        orderIndex: qIndex,
        options: q.options.map((o, oIndex) => ({
          ...o,
          orderIndex: oIndex,
        })),
      })),
    }

    createPoll.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Poll created successfully! 🎉' })
        navigate('/dashboard')
      },
      onError: (error: any) => {
        toast({
          title: 'Failed to create poll',
          description: error.response?.data?.error?.message || 'Unknown error occurred',
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <div className="min-h-full bg-background">
      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-10 border-b border-white/6 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-white"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={createPoll.isPending}
              onClick={form.handleSubmit(onSubmit)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_16px_rgba(0,220,130,0.25)] px-5"
            >
              {createPoll.isPending ? 'Creating…' : 'Create Poll'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-8 animate-fade-in">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Create New Poll</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure your poll settings, then add questions below.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* ── General Settings ── */}
          <Section icon={<FileText className="h-4 w-4 text-primary" />} title="General Settings">
            <div className="space-y-5">
              {/* Title */}
              <Field label="Poll Title" error={form.formState.errors.title?.message}>
                <Input
                  id="title"
                  placeholder="e.g. What should we have for lunch?"
                  {...form.register('title')}
                  className={`bg-background border-white/10 placeholder-slate-600 focus-visible:ring-primary/40 focus-visible:border-primary/50 ${
                    form.formState.errors.title ? 'border-destructive' : ''
                  }`}
                />
              </Field>

              {/* Description */}
              <Field label="Description" hint="Optional — give respondents some context.">
                <Input
                  id="description"
                  placeholder="e.g. Help us decide the menu for Friday's team gathering."
                  {...form.register('description')}
                  className="bg-background border-white/10 placeholder-slate-600 focus-visible:ring-primary/40 focus-visible:border-primary/50"
                />
              </Field>
            </div>
          </Section>

          {/* ── Poll Settings ── */}
          <Section icon={<Shield className="h-4 w-4 text-primary" />} title="Poll Settings">
            <div className="space-y-4">
              {/* Anonymous toggle */}
              <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-white">Anonymous Responses</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Allow users to vote without signing in.</p>
                </div>
                <Controller
                  control={form.control}
                  name="isAnonymous"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>

              {/* Expiry */}
              <div className="rounded-lg border border-white/8 bg-white/3 px-4 py-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm font-medium text-white">Poll Expiry</p>
                  <span className="text-[11px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded-full">Optional</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The poll will automatically close and stop accepting responses after this time.
                </p>
                <input
                  id="expiresAt"
                  type="datetime-local"
                  {...form.register('expiresAt')}
                  className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 [color-scheme:dark]"
                />
              </div>
            </div>
          </Section>

          {/* ── Questions ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">Q</span>
                </div>
                <h2 className="text-base font-semibold text-white">Questions</h2>
                <span className="text-xs text-muted-foreground bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
                  {questions.length}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/10 bg-transparent hover:bg-white/5 text-muted-foreground hover:text-white text-xs"
                onClick={() =>
                  appendQuestion({
                    text: '',
                    isRequired: true,
                    options: [{ text: '' }, { text: '' }],
                  })
                }
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Question
              </Button>
            </div>

            {questions.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <QuestionBuilder
                  control={form.control}
                  register={form.register}
                  errors={form.formState.errors}
                  index={index}
                  remove={() => removeQuestion(index)}
                  canRemove={questions.length > 1}
                />
              </motion.div>
            ))}

            {form.formState.errors.questions && !Array.isArray(form.formState.errors.questions) && (
              <p className="text-sm text-destructive text-center">
                {form.formState.errors.questions.message}
              </p>
            )}
          </div>

          {/* ── Submit ── (bottom duplicate for long forms) */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/6">
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-muted-foreground">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createPoll.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_16px_rgba(0,220,130,0.25)] px-6"
            >
              {createPoll.isPending ? 'Creating…' : 'Create Poll'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Section wrapper ────────────────────────────────────────
function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-card overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-white/6 px-5 py-3.5">
        {icon}
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── Field wrapper ──────────────────────────────────────────
function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-300">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

// ── Question builder ───────────────────────────────────────
function QuestionBuilder({
  control,
  register,
  errors,
  index,
  remove,
  canRemove,
}: {
  control: any
  register: any
  errors: any
  index: number
  remove: () => void
  canRemove: boolean
}) {
  const { fields: options, append, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  })

  return (
    <div className="rounded-xl border border-white/8 bg-card overflow-hidden">
      {/* Question header */}
      <div className="flex items-center gap-3 border-b border-white/6 px-4 py-3">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-move shrink-0" />
        <span className="text-xs font-bold text-primary bg-primary/10 rounded-md px-2 py-0.5">
          Q{index + 1}
        </span>
        <Input
          placeholder={`Type your question here…`}
          className={`flex-1 bg-transparent border-0 border-b border-white/8 rounded-none px-0 pb-0 text-sm font-medium text-white placeholder-slate-600 focus-visible:ring-0 focus-visible:border-primary/50 ${
            errors?.questions?.[index]?.text ? 'border-destructive' : ''
          }`}
          {...register(`questions.${index}.text`)}
        />
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={remove}
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Options */}
      <div className="p-4 space-y-2">
        {options.map((opt, optIndex) => (
          <div key={opt.id} className="flex items-center gap-3 group">
            <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white/20 group-focus-within:border-primary/60 transition-colors" />
            <Input
              placeholder={`Option ${optIndex + 1}`}
              {...register(`questions.${index}.options.${optIndex}.text`)}
              className={`flex-1 h-8 text-sm bg-transparent border-0 border-b border-white/6 rounded-none px-0 text-white placeholder-slate-600 focus-visible:ring-0 focus-visible:border-primary/40 ${
                errors?.questions?.[index]?.options?.[optIndex]?.text ? 'border-destructive' : ''
              }`}
            />
            {options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                onClick={() => removeOption(optIndex)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}

        {errors?.questions?.[index]?.options?.message && (
          <p className="text-xs text-destructive">{errors.questions[index].options.message}</p>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-1 text-xs text-muted-foreground hover:text-white hover:bg-white/5 pl-0"
          onClick={() => append({ text: '' })}
        >
          <Plus className="mr-1.5 h-3 w-3" /> Add option
        </Button>
      </div>

      {/* Required toggle */}
      <div className="flex items-center justify-between border-t border-white/6 px-4 py-2.5">
        <span className="text-xs text-muted-foreground">Required question</span>
        <Controller
          control={control}
          name={`questions.${index}.isRequired`}
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>
    </div>
  )
}
