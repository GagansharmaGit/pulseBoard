import { ArrowLeft, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function TermsPage() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 -ml-4 hover:bg-white/5">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="glass-panel p-8 md:p-12 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <FileText className="h-6 w-6 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-black text-white">Terms of Service</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using the PulseBoard platform ("Service"), you agree to be bound by these Terms of Service. 
            If you disagree with any part of the terms, you may not access the Service.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            PulseBoard is a platform that allows users to create, manage, and share polls. We provide analytics and real-time 
            tracking for collected responses. We reserve the right to modify or discontinue, temporarily or permanently, 
            the Service with or without notice.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. User Conduct and Abuse</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree not to use the Service to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
            <li>Create polls that harass, abuse, or harm another person.</li>
            <li>Collect highly sensitive personal data (e.g., medical records, financial information) without proper compliance.</li>
            <li>Use automated systems (bots) to manipulate poll results.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            In no event shall PulseBoard, nor its directors, employees, partners, agents, suppliers, or affiliates, 
            be liable for any indirect, incidental, special, consequential or punitive damages, including without 
            limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access 
            to or use of or inability to access or use the Service.
          </p>
        </div>
      </div>
    </div>
  )
}
