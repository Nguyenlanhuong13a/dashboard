'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react'

interface AuthFormProps {
  onVerificationNeeded: (email: string) => void
}

export function AuthForm({ onVerificationNeeded }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login'
      const body = isSignUp
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (data.requiresVerification) {
        onVerificationNeeded(data.email)
        return
      }

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      window.location.href = '/'
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="font-display text-2xl font-semibold text-primary mb-2">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-gray-500 text-sm">
          {isSignUp ? 'Start your 14-day free trial' : 'Sign in to your dashboard'}
        </p>
      </div>

      <div className="border border-gray-200 rounded">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError('') }}
            className={`flex-1 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer ${
              !isSignUp
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError('') }}
            className={`flex-1 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer ${
              isSignUp
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded border border-red-200 bg-white">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="input pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="input pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                minLength={isSignUp ? 8 : 6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="input pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isSignUp && (
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? (isSignUp ? 'Creating...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        By continuing, you agree to our Terms of Service
      </p>
    </>
  )
}
