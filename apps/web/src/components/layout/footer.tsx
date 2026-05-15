import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-zinc-950/50 backdrop-blur-md py-12 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center space-x-2 text-emerald-500 font-bold text-xl">
            <span>PulseBoard</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
            Enterprise-grade feedback & polling platform built for scale.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3">
          <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 border border-white/10 bg-white/5 rounded-full px-3 py-1">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span>GDPR Compliant</span>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-1">
            &copy; {new Date().getFullYear()} PulseBoard Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
