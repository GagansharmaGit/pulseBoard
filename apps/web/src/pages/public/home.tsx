import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SignInButton, useAuth } from '@clerk/react'
import { ArrowRight, Play, CheckCircle2, Box, Zap, FileText, Share2, BarChart3, ShieldCheck } from 'lucide-react'

export function HomePage() {
  const { isSignedIn } = useAuth()
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section Split Layout */}
      <section className="relative w-full overflow-hidden bg-[#0A0A0A] pt-24 pb-32">
        {/* Background Sweep Line */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <svg className="absolute w-[200%] h-full left-[-50%] top-0 opacity-40" preserveAspectRatio="none" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 600 Q 400 600, 700 400 T 1500 100" stroke="url(#paint0_linear)" strokeWidth="2" strokeDasharray="5 5" />
            <path d="M-100 600 Q 400 600, 700 400 T 1500 100" stroke="#10b981" strokeWidth="1" />
            <circle cx="300" cy="530" r="4" fill="#10b981" className="animate-pulse" />
            <circle cx="700" cy="400" r="4" fill="#10b981" className="animate-pulse" />
            <defs>
              <linearGradient id="paint0_linear" x1="-100" y1="600" x2="1500" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10b981" stopOpacity="0" />
                <stop offset="0.5" stopColor="#10b981" stopOpacity="1" />
                <stop offset="1" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="container relative z-10 mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start max-w-xl"
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="ml-2 text-zinc-300">Smart polls. Real-time results.</span>
            </div>
            
            <h1 className="text-balance text-5xl sm:text-6xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.1] text-white">
              Polls that <br /> 
              <span className="text-emerald-500">spark action.</span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-zinc-400 font-medium leading-relaxed max-w-lg">
              Create beautiful polls, share anywhere, and get real-time feedback with powerful analytics.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              {isSignedIn ? (
                <Link to="/dashboard">
                  <Button className="h-12 px-8 text-base font-semibold rounded-full bg-emerald-500 hover:bg-emerald-600 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <Button className="h-12 px-8 text-base font-semibold rounded-full bg-emerald-500 hover:bg-emerald-600 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </SignInButton>
              )}
              <Button variant="outline" className="h-12 px-8 text-base font-semibold rounded-full border-white/10 bg-transparent hover:bg-white/5 text-white">
                View Demo <Play className="ml-2 h-4 w-4 text-emerald-500" />
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-400 font-medium">
              <span className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> No credit card required</span>
              <span className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Free forever plan</span>
              <span className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Setup in 60 seconds</span>
            </div>
          </motion.div>

          {/* Right Content: Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:h-[600px] w-full flex items-center justify-center lg:justify-end perspective-[2000px]"
          >
            {/* 3D Rotated Glass Panel */}
            <div className="w-full max-w-2xl bg-[#111111]/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden transform lg:rotate-y-[-5deg] lg:rotate-x-[2deg] lg:scale-105 origin-right ring-1 ring-white/5">
              
              {/* Mockup Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40">
                <div className="flex items-center gap-2">
                  <div className="flex items-end gap-1 h-4">
                    <div className="w-1 h-2 bg-emerald-500 rounded-sm"></div>
                    <div className="w-1 h-3.5 bg-emerald-500 rounded-sm"></div>
                    <div className="w-1 h-2.5 bg-emerald-500 rounded-sm"></div>
                  </div>
                  <span className="font-bold text-sm text-white tracking-wide">PulseBoard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10"></div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">A</div>
                </div>
              </div>

              {/* Mockup Body Layout */}
              <div className="flex">
                {/* Sidebar */}
                <div className="hidden sm:flex flex-col w-48 p-4 border-r border-white/5 gap-2 bg-black/20">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-md text-xs font-medium flex items-center gap-2"><Box className="w-3.5 h-3.5"/> Overview</div>
                  <div className="p-2 text-zinc-400 rounded-md text-xs font-medium flex items-center gap-2"><FileText className="w-3.5 h-3.5"/> Polls</div>
                  <div className="p-2 text-zinc-400 rounded-md text-xs font-medium flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5"/> Analytics</div>
                  
                  <div className="mt-auto p-4 rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/5">
                    <Zap className="w-4 h-4 text-emerald-500 mb-2" />
                    <div className="text-xs font-bold text-white mb-1">Upgrade to Pro</div>
                    <div className="text-[10px] text-zinc-500 mb-3">Unlock advanced analytics and more.</div>
                    <div className="text-[10px] bg-white/10 text-white text-center py-1 rounded">Upgrade Now</div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg">Welcome back, Alex 👋</h3>
                      <p className="text-xs text-zinc-500">Here's what happening with your polls.</p>
                    </div>
                    <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md text-xs font-medium">
                      + Create Poll
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { l: "Total Polls", v: "24", p: "+12%", color: "text-emerald-500" },
                      { l: "Total Responses", v: "1,825", p: "+28%", color: "text-emerald-500" },
                      { l: "Active Polls", v: "8", p: "+14%", color: "text-emerald-500" },
                      { l: "Avg. Completion", v: "76%", p: "+9%", color: "text-emerald-500" }
                    ].map((stat, i) => (
                      <div key={i} className="p-3 bg-black/40 border border-white/5 rounded-xl">
                        <div className="text-[10px] text-zinc-500 mb-1">{stat.l}</div>
                        <div className="text-xl font-bold text-white mb-1">{stat.v}</div>
                        <div className={`text-[9px] ${stat.color} bg-white/5 inline-block px-1 rounded`}>{stat.p} this month</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart Area */}
                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-xs font-bold text-white">Responses Over Time</div>
                      <div className="text-[10px] text-zinc-500 bg-white/5 px-2 py-1 rounded">This Month</div>
                    </div>
                    {/* CSS Chart SVG */}
                    <svg className="w-full h-24" viewBox="0 0 400 100" preserveAspectRatio="none">
                      <path d="M 0 80 Q 50 70, 100 50 T 200 40 T 300 60 T 400 20 L 400 100 L 0 100 Z" fill="url(#chart-grad)" opacity="0.2"/>
                      <path d="M 0 80 Q 50 70, 100 50 T 200 40 T 300 60 T 400 20" fill="none" stroke="#10b981" strokeWidth="2"/>
                      <circle cx="100" cy="50" r="3" fill="#10b981"/>
                      <circle cx="200" cy="40" r="3" fill="#10b981"/>
                      <circle cx="300" cy="60" r="3" fill="#10b981"/>
                      <circle cx="400" cy="20" r="3" fill="#10b981"/>
                      <defs>
                        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="100%">
                          <stop stopColor="#10b981" stopOpacity="1" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Bottom Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                      <div className="text-xs font-bold text-white mb-3">Recent Polls</div>
                      <div className="flex items-center justify-between p-2 rounded bg-white/5">
                        <div className="flex gap-2 items-center">
                          <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">P</div>
                          <div>
                            <div className="text-[10px] font-bold text-white">Product Feedback</div>
                            <div className="text-[9px] text-zinc-500">120 responses</div>
                          </div>
                        </div>
                        <div className="text-[9px] text-emerald-500">Active</div>
                      </div>
                    </div>
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                      <div className="text-xs font-bold text-white mb-2">Responses by Device</div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-r-indigo-500 border-b-amber-500"></div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[9px] text-zinc-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Desktop 52%</div>
                          <div className="flex items-center gap-1 text-[9px] text-zinc-400"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Mobile 38%</div>
                          <div className="flex items-center gap-1 text-[9px] text-zinc-400"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Tablet 10%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
            {/* Glowing orb behind mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-emerald-500/20 blur-[120px] rounded-full -z-10"></div>
          </motion.div>
        </div>
      </section>



      {/* Features Section - Matches image 4 column layout */}
      <section className="bg-[#0A0A0A] px-4 py-24 border-t border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<FileText className="h-6 w-6 text-emerald-400" />}
              iconBg="bg-emerald-500/10"
              title="Easy to Create"
              description="Build custom polls in minutes with a simple and intuitive builder."
              delay={0.1}
            />
            <FeatureCard
              icon={<Share2 className="h-6 w-6 text-emerald-500" />}
              iconBg="bg-emerald-500/20"
              title="Share Anywhere"
              description="Share via link or QR code and reach your audience instantly."
              delay={0.2}
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-amber-500" />}
              iconBg="bg-amber-500/10"
              title="Real-time Analytics"
              description="Watch responses come in live with beautiful, interactive charts."
              delay={0.3}
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6 text-sky-400" />}
              iconBg="bg-sky-500/10"
              title="Secure & Reliable"
              description="Enterprise-grade security with anonymous and auth options."
              delay={0.4}
            />
          </div>
        </div>
      </section>

    </div>
  )
}

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode
  iconBg: string
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
      className="rounded-2xl border border-white/5 bg-[#111111]/80 p-6 shadow-sm transition-all hover:bg-white/5"
    >
      <div className={`mb-5 inline-flex items-center justify-center rounded-xl ${iconBg} p-3`}>
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}

}
