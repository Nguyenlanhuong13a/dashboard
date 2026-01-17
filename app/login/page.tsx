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
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Hero */}
      <LoginHero />

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <Building2 className="w-6 h-6 text-primary" />
            <span className="font-display text-xl font-semibold text-primary">RealEstate Pro</span>
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
