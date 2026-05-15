import { Outlet, Link } from 'react-router-dom'
import { SignInButton, UserButton, useAuth } from '@clerk/react'
import { Toaster } from '@/components/ui/toaster'
import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RootLayout() {
  const { isSignedIn } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-background/95 selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">GPollS</span>
          </Link>

          <nav className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-sm font-medium">
                    Dashboard
                  </Button>
                </Link>
                <div className="pl-2 border-l border-border h-6 flex items-center">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'h-8 w-8 ring-2 ring-primary/20 transition-all hover:ring-primary/50',
                      },
                    }}
                  />
                </div>
              </>
            ) : (
              <SignInButton mode="modal">
                <Button variant="default" className="shadow-sm">Sign In</Button>
              </SignInButton>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <Toaster />
    </div>
  )
}
