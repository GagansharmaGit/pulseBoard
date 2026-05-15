import { Outlet, Link } from 'react-router-dom'
import { SignInButton, UserButton, useAuth } from '@clerk/react'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Footer } from './footer'

export function RootLayout() {
  const { isSignedIn } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-background/95 selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <div className="flex items-center justify-center">
              {/* Custom simple PulseBoard logo to match the vertical bars from image */}
              <div className="flex items-end gap-1 h-6">
                <div className="w-1.5 h-3 bg-emerald-500 rounded-sm"></div>
                <div className="w-1.5 h-5 bg-emerald-500 rounded-sm"></div>
                <div className="w-1.5 h-4 bg-emerald-500 rounded-sm"></div>
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">PulseBoard</span>
          </Link>


          <nav className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-sm font-medium hover:bg-white/5 hover:text-white">
                    Dashboard
                  </Button>
                </Link>
                <div className="pl-2 border-l border-white/10 h-6 flex items-center">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'h-8 w-8 ring-2 ring-emerald-500/20 transition-all hover:ring-emerald-500/50',
                      },
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <Button variant="outline" className="border-white/10 bg-transparent hover:bg-white/5 text-zinc-300 hover:text-white transition-all">Log in</Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">Get Started</Button>
                </SignInButton>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <Footer />
      <Toaster />
    </div>
  )
}
