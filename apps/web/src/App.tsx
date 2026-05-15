import { Routes, Route, Navigate } from 'react-router-dom'
import { Show, SignIn, SignUp } from '@clerk/react'
import { Toaster } from './components/ui/toaster'

const DashboardPage = () => <div className="p-8 text-center text-slate-500">Dashboard — Phase 7</div>
const LandingPage = () => <div className="p-8 text-center text-slate-500">Landing — Phase 7</div>

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <Show
      when="signed-in"
      fallback={<Navigate to="/sign-in" replace />}
    >
      {children}
    </Show>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/sign-in/*"
          element={<SignIn routing="path" path="/sign-in" />}
        />
        <Route
          path="/sign-up/*"
          element={<SignUp routing="path" path="/sign-up" />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </>
  )
}
