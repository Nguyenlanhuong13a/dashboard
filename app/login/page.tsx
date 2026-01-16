'use client'

import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { LoginHero, AuthForm, VerificationForm } from '@/components/auth'

type AuthStep = 'auth' | 'verify'

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('auth')
  const [verifyEmail, setVerifyEmail] = useState('')

  const handleVerificationNeeded = (email: string) => {
    setVerifyEmail(email)
    setStep('verify')
  }

  const handleBackToAuth = () => {
    setStep('auth')
    setVerifyEmail('')
  }

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Side - Hero */}
      <LoginHero />

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Background decoration for mobile */}
        <div className="absolute inset-0 bg-mesh lg:hidden" />
        <div className="absolute top-10 right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl lg:hidden" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-accent/5 rounded-full blur-3xl lg:hidden" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-primary-dark">RealEstate Pro</span>
          </div>

          {step === 'auth' ? (
            <AuthForm onVerificationNeeded={handleVerificationNeeded} />
          ) : (
            <VerificationForm email={verifyEmail} onBack={handleBackToAuth} />
          )}
        </div>
      </div>
    </div>
  )
}
