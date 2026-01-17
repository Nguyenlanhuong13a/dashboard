'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Loader2, Mail, RefreshCw } from 'lucide-react'

interface VerificationFormProps {
  email: string
  onBack: () => void
}

export function VerificationForm({ email, onBack }: VerificationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [resendCooldown, setResendCooldown] = useState(60)
  const codeInputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)
    if (digit && index < 5) {
      codeInputs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputs.current[index - 1]?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }
    setCode(newCode)
    const focusIndex = Math.min(pastedData.length, 5)
    codeInputs.current[focusIndex]?.focus()
  }

  const handleVerify = async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    if (!email) {
      setError('Session expired. Please register again.')
      onBack()
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Verification failed')
        return
      }

      window.location.href = '/'
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to resend code')
        return
      }

      setResendCooldown(60)
      setCode(['', '', '', '', '', ''])
      codeInputs.current[0]?.focus()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </button>

      <div className="mb-8">
        <div className="flex items-center justify-center mb-6 mx-auto lg:mx-0 w-12 h-12 border border-gray-200 rounded">
          <Mail className="w-5 h-5 text-gray-400" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-primary mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm">
          We sent a verification code to<br />
          <span className="font-medium text-primary">{email}</span>
        </p>
      </div>

      <div className="border border-gray-200 rounded p-6">
        {error && (
          <div className="mb-5 p-3 rounded border border-red-200 bg-white">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Code inputs */}
        <div className="flex gap-2 justify-center mb-6">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { codeInputs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleCodeKeyDown(i, e)}
              onPaste={handleCodePaste}
              className="w-11 h-12 text-center text-lg font-display font-semibold border border-gray-200 rounded text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || code.join('').length !== 6}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Verify Email
        </button>

        <div className="mt-5 text-center">
          <span className="text-sm text-gray-500">
            Didn't receive the code?{' '}
          </span>
          {resendCooldown > 0 ? (
            <span className="text-sm text-gray-400">Resend in {resendCooldown}s</span>
          ) : (
            <button
              onClick={handleResendCode}
              disabled={loading}
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Resend
            </button>
          )}
        </div>
      </div>
    </>
  )
}
