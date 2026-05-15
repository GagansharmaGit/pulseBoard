import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SignInButton, useAuth } from '@clerk/react'
import { ArrowRight, BarChart3, CheckCircle2, Share2 } from 'lucide-react'

export function HomePage() {
  const { isSignedIn } = useAuth()
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-24 pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-balance text-5xl font-extrabold tracking-tight sm:text-7xl">
              Create beautiful polls in <span className="text-primary">seconds.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Gather feedback, make decisions, and analyze results in real-time. No sign-up required for your respondents.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            {isSignedIn ? (
              <Link to="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25">
                  Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid gap-12 sm:grid-cols-3">
          <FeatureCard
            icon={<CheckCircle2 className="h-10 w-10 text-primary" />}
            title="Easy Builder"
            description="Create custom polls with multiple questions. Mark them as required or optional."
            delay={0.1}
          />
          <FeatureCard
            icon={<Share2 className="h-10 w-10 text-primary" />}
            title="Instant Sharing"
            description="Share your unique poll link anywhere. Respondents don't need an account."
            delay={0.2}
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-primary" />}
            title="Live Analytics"
            description="Watch the votes roll in with real-time, interactive charts."
            delay={0.3}
          />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md"
    >
      <div className="mb-6 inline-block rounded-xl bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}
