import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 -ml-4 hover:bg-white/5">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="glass-panel p-8 md:p-12 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to PulseBoard. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. GDPR Compliance</h2>
          <p className="text-muted-foreground leading-relaxed">
            We are fully compliant with the General Data Protection Regulation (GDPR). 
            If you are a resident of the European Economic Area (EEA), you have certain data protection rights:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
            <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
            <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
            <li><strong>The right to erasure ("Right to be forgotten"):</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
            <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. Data Collection in Polls</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you respond to a poll anonymously, we do not collect your IP address, name, or email. 
            We use localized browser storage (localStorage) to prevent duplicate voting, which is not sent to our servers.
            When you respond to an authenticated poll, your user ID is securely linked to your response.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            For any privacy-specific concerns or to exercise your GDPR rights, please contact our Data Protection Officer at privacy@pulseboard.example.com.
          </p>
        </div>
      </div>
    </div>
  )
}
