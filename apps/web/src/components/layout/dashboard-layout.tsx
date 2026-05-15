import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { LoadingSpinner } from '../shared/loading-spinner'

export function DashboardLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/')
    }
  }, [isLoaded, isSignedIn, navigate])

  if (!isLoaded) {
    return <LoadingSpinner className="h-12 w-12" />
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="flex-1 bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  )
}
