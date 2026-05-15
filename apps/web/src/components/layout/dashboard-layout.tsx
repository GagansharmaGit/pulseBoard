import { useEffect, useState } from 'react'
import { Outlet, useNavigate, NavLink, Link } from 'react-router-dom'
import { useAuth, UserButton } from '@clerk/react'
import { LoadingSpinner } from '../shared/loading-spinner'
import { Toaster } from '@/components/ui/toaster'
import {
  LayoutDashboard,
  BarChart3,
  PlusCircle,
  Menu,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',       label: 'Overview',    icon: LayoutDashboard, end: true },
  { to: '/dashboard/polls', label: 'My Polls',    icon: BarChart3,       end: false },
  { to: '/dashboard/polls/new', label: 'Create Poll', icon: PlusCircle,  end: false },
]

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <>
      {/* Logo */}
      <Link
        to="/"
        onClick={onNavClick}
        className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/6 px-5"
      >
        <div className="flex items-end gap-0.5 h-5">
          <div className="w-1.5 h-2.5 rounded-sm bg-primary" />
          <div className="w-1.5 h-4 rounded-sm bg-primary" />
          <div className="w-1.5 h-3 rounded-sm bg-primary" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white">PulseBoard</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user section */}
      <div className="border-t border-white/6 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-7 w-7 ring-1 ring-primary/30',
              },
            }}
          />
          <span className="text-xs text-muted-foreground truncate">Account</span>
        </div>
      </div>
    </>
  )
}

export function DashboardLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) navigate('/')
  }, [isLoaded, isSignedIn, navigate])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (!isLoaded) return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner className="h-10 w-10" />
    </div>
  )
  if (!isSignedIn) return null

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/6 bg-card">
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/6 bg-card
          transition-transform duration-300 ease-in-out md:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3.5 rounded-md p-1 text-muted-foreground hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/6 bg-card px-4 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-end gap-0.5 h-4">
            <div className="w-1 h-2 rounded-sm bg-primary" />
            <div className="w-1 h-3.5 rounded-sm bg-primary" />
            <div className="w-1 h-2.5 rounded-sm bg-primary" />
          </div>
          <span className="text-sm font-bold text-white">PulseBoard</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  )
}
