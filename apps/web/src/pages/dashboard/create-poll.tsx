import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ArrowLeft, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
    // Transform arrays into the format expected by the API (add orderIndex)
    const payload = {
      ...data,
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
        toast({ title: 'Poll created successfully' })
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
    <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Poll</h1>
          <p className="text-sm text-muted-foreground">Configure your poll and add questions.</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Poll Title</Label>
              <Input
                id="title"
                placeholder="What should we have for lunch?"
                {...form.register('title')}
                className={form.formState.errors.title ? 'border-destructive' : ''}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Help us decide the menu for Friday's team gathering."
                {...form.register('description')}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Anonymous Responses</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to vote without signing in.
                </p>
              </div>
              <Controller
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Questions</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendQuestion({
                  text: '',
                  isRequired: true,
                  options: [{ text: '' }, { text: '' }],
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>

          {questions.map((field, index) => (
            <QuestionBuilder
              key={field.id}
              control={form.control}
              register={form.register}
              errors={form.formState.errors}
              index={index}
              remove={() => removeQuestion(index)}
              canRemove={questions.length > 1}
            />
          ))}
          {form.formState.errors.questions && !Array.isArray(form.formState.errors.questions) && (
            <p className="text-sm text-destructive text-center">
              {form.formState.errors.questions.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button type="submit" disabled={createPoll.isPending} className="shadow-md">
            {createPoll.isPending ? 'Creating...' : 'Create Poll'}
          </Button>
        </div>
      </form>
    </div>
  )
}

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
    <Card className="relative shadow-sm transition-all hover:shadow-md">
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 cursor-move p-2 text-muted-foreground/50 hover:text-muted-foreground">
        <GripVertical className="h-5 w-5" />
      </div>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Input
              placeholder={`Question ${index + 1}`}
              className={`text-lg font-medium shadow-none focus-visible:ring-1 ${
                errors?.questions?.[index]?.text ? 'border-destructive' : ''
              }`}
              {...register(`questions.${index}.text`)}
            />
            {errors?.questions?.[index]?.text && (
              <p className="text-sm text-destructive">{errors.questions[index].text.message}</p>
            )}
          </div>
          {canRemove && (
            <Button type="button" variant="ghost" size="icon" onClick={remove} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 pl-2">
          {options.map((opt, optIndex) => (
            <div key={opt.id} className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
              <div className="flex-1">
                <Input
                  placeholder={`Option ${optIndex + 1}`}
                  {...register(`questions.${index}.options.${optIndex}.text`)}
                  className={`h-9 shadow-none ${
                    errors?.questions?.[index]?.options?.[optIndex]?.text ? 'border-destructive' : ''
                  }`}
                />
              </div>
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => removeOption(optIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {errors?.questions?.[index]?.options?.message && (
            <p className="text-sm text-destructive">{errors.questions[index].options.message}</p>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 text-muted-foreground"
            onClick={() => append({ text: '' })}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Option
          </Button>
        </div>

        <Separator />
        
        <div className="flex items-center justify-between pl-2">
          <Label className="text-sm font-normal text-muted-foreground cursor-pointer">Required Question</Label>
          <Controller
            control={control}
            name={`questions.${index}.isRequired`}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
