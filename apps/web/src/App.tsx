import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/react'

// Layouts
import { RootLayout } from './components/layout/root-layout'
import { DashboardLayout } from './components/layout/dashboard-layout'

// Pages
import { HomePage } from './pages/public/home'
import { DashboardPage, PollsPage } from './pages/dashboard/dashboard'
import { CreatePollPage } from './pages/dashboard/create-poll'
import { RespondPage } from './pages/public/respond'
import { AnalyticsPage } from './pages/public/analytics'
import { PrivacyPage } from './pages/public/privacy'
import { TermsPage } from './pages/public/terms'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'p/:pollId',
        element: <RespondPage />,
      },
      {
        path: 'p/:pollId/results',
        element: <AnalyticsPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
      },
      {
        path: 'terms',
        element: <TermsPage />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'polls',
        element: <PollsPage />,
      },
      {
        path: 'polls/new',
        element: <CreatePollPage />,
      },
    ],
  },
])

function App() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorBackground: '#0B1120',
          colorInputBackground: '#111827',
          colorText: '#F8FAFC',
          colorTextSecondary: '#94A3B8',
          colorPrimary: '#00DC82',
          colorInputText: '#F8FAFC',
          borderRadius: '0.75rem',
          colorNeutral: '#1F2937',
        },
        elements: {
          card: 'bg-[#0B1120] border border-white/10 shadow-2xl',
          headerTitle: 'text-white font-black tracking-tight',
          headerSubtitle: 'text-slate-400',
          socialButtonsBlockButton: 'border-white/10 bg-white/5 text-white hover:bg-white/10',
          formButtonPrimary: 'bg-[#00DC82] text-[#050816] font-semibold hover:bg-[#00DC82]/90',
          footerActionLink: 'text-[#00DC82] hover:text-[#00DC82]/80',
          formFieldInput: 'bg-[#111827] border-white/10 text-white placeholder-slate-500 focus:border-[#00DC82]/50',
          formFieldLabel: 'text-slate-300',
          identityPreview: 'bg-white/5 border-white/10',
          dividerLine: 'bg-white/10',
          dividerText: 'text-slate-500',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ClerkProvider>
  )
}

export default App
