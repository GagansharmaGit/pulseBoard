import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/react'

// Layouts
import { RootLayout } from './components/layout/root-layout'
import { DashboardLayout } from './components/layout/dashboard-layout'

// Pages
import { HomePage } from './pages/public/home'
import { DashboardPage } from './pages/dashboard/dashboard'
import { CreatePollPage } from './pages/dashboard/create-poll'
import { RespondPage } from './pages/public/respond'
import { AnalyticsPage } from './pages/public/analytics'

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
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'polls/new',
            element: <CreatePollPage />,
          },
        ],
      },
    ],
  },
])

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ClerkProvider>
  )
}

export default App
