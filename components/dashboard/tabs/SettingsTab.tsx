'use client'

import { RefObject } from 'react'
import {
  User, CreditCard, Zap, Crown, Shield, Check, AlertCircle,
  Loader2, Camera, Phone, BadgeCheck, Brain, Mail, Target
} from 'lucide-react'
import { UsageBar } from '@/components/dashboard/shared'

interface UserData {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  phone?: string | null
  licenseNumber?: string | null
}

interface SubscriptionData {
  subscription: {
    id: string
    plan: string
    status: string
    currentPeriodEnd: string
  }
  usage: {
    properties: { current: number; limit: number }
    leads: { current: number; limit: number }
    documents: { current: number; limit: number }
  }
  plans: Array<{
    name: string
    price: number
    limits: { properties: number; leads: number; documents: number; teamMembers: number }
    current: boolean
  }>
}

interface ProfileForm {
  name: string
  phone: string
  licenseNumber: string
}

interface SettingsTabProps {
  user: UserData
  subscriptionData: SubscriptionData
  profileForm: ProfileForm
  profileSaving: boolean
  profileSaved: boolean
  profileError: string | null
  avatarUploading: boolean
  avatarInputRef: RefObject<HTMLInputElement | null>
  upgrading: boolean
  onProfileChange: (field: keyof ProfileForm, value: string) => void
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveAvatar: () => void
  onUpgradePlan: (planName: string) => void
  onBuyCredits: () => void
  onChangePassword: () => void
  onQuickBuyCredits: (type: string, amount: number) => Promise<void>
}

export function SettingsTab({
  user,
  subscriptionData,
  profileForm,
  profileSaving,
  profileSaved,
  profileError,
  avatarUploading,
  avatarInputRef,
  upgrading,
  onProfileChange,
  onAvatarUpload,
  onRemoveAvatar,
  onUpgradePlan,
  onBuyCredits,
  onChangePassword,
  onQuickBuyCredits,
}: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="border border-gray-200 rounded bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-sm font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-4 w-4 text-gray-600" /> Profile
          </h2>
          <div className="flex items-center gap-2 text-xs">
            {profileSaving && (
              <span className="flex items-center gap-1 text-gray-400">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving...
              </span>
            )}
            {profileSaved && !profileSaving && (
              <span className="flex items-center gap-1 text-gray-600">
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
          </div>
        </div>

        {profileError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600">{profileError}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              {user.image ? (
                <img
                  src={user.image}
                  alt="Profile"
                  className="w-20 h-20 rounded object-cover border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded border border-gray-200 flex items-center justify-center text-gray-600 text-2xl font-display font-medium bg-gray-50">
                  {profileForm.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 rounded bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                aria-label="Change profile photo"
              >
                {avatarUploading ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onAvatarUpload}
              className="hidden"
            />
            <div className="flex gap-2">
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="text-xs text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                {user.image ? 'Change' : 'Upload'}
              </button>
              {user.image && (
                <>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={onRemoveAvatar}
                    disabled={avatarUploading}
                    className="text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-4">
            <div>
              <label htmlFor="profile-name" className="block text-xs text-gray-500 mb-1.5">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={profileForm.name}
                onChange={(e) => onProfileChange('name', e.target.value)}
                placeholder="Enter your name"
                className="input-glass"
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-xs text-gray-500 mb-1.5">
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 rounded bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-phone" className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => onProfileChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="input-glass"
                />
              </div>
              <div>
                <label htmlFor="profile-license" className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" /> License Number
                </label>
                <input
                  id="profile-license"
                  type="text"
                  value={profileForm.licenseNumber}
                  onChange={(e) => onProfileChange('licenseNumber', e.target.value)}
                  placeholder="RE-123456"
                  className="input-glass"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs text-gray-400">
              <span>Role: <span className="text-gray-600 font-medium">{user.role}</span></span>
              <span>•</span>
              <span>Changes save automatically</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Plan & Usage */}
      <div className="border border-gray-200 rounded bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-sm font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-600" /> Current Plan
          </h2>
          <span className={`px-3 py-1.5 rounded text-xs font-medium ${
            subscriptionData.subscription.plan === 'FREE' ? 'bg-gray-100 text-gray-600' :
            subscriptionData.subscription.plan === 'STARTER' ? 'bg-gray-100 text-gray-700' :
            subscriptionData.subscription.plan === 'PROFESSIONAL' ? 'bg-gray-100 text-gray-800' :
            'bg-amber-50 text-amber-600'
          }`}>
            {subscriptionData.subscription.plan === 'FREE' && <span>Free Plan</span>}
            {subscriptionData.subscription.plan === 'STARTER' && <span>Starter - $29/mo</span>}
            {subscriptionData.subscription.plan === 'PROFESSIONAL' && <span>Professional - $79/mo</span>}
            {subscriptionData.subscription.plan === 'ENTERPRISE' && <span>Enterprise - $199/mo</span>}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <UsageBar label="Properties" current={subscriptionData.usage.properties.current} limit={subscriptionData.usage.properties.limit} />
          <UsageBar label="Leads" current={subscriptionData.usage.leads.current} limit={subscriptionData.usage.leads.limit} />
          <UsageBar label="Documents" current={subscriptionData.usage.documents.current} limit={subscriptionData.usage.documents.limit} />
        </div>

        {subscriptionData.subscription.plan === 'FREE' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-gray-900 font-medium">Upgrade to unlock more features</p>
              <p className="text-xs text-gray-500 mt-0.5">Get more properties, leads, and advanced analytics</p>
            </div>
          </div>
        )}
      </div>

      {/* Credits Section */}
      <div className="border border-gray-200 rounded bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="h-4 w-4 text-gray-600" /> Credits
          </h2>
          <button onClick={onBuyCredits} className="text-xs text-gray-600 hover:text-gray-900 font-medium cursor-pointer">
            Buy More
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-gray-600" />
              <span className="text-xs text-gray-600 font-medium">AI Credits</span>
            </div>
            <p className="font-display text-xl font-semibold text-gray-900">0</p>
            <p className="text-xs text-gray-400">For lead scoring</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-gray-600" />
              <span className="text-xs text-gray-600 font-medium">Email Credits</span>
            </div>
            <p className="font-display text-xl font-semibold text-gray-900">0</p>
            <p className="text-xs text-gray-400">For campaigns</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-gray-600" />
              <span className="text-xs text-gray-600 font-medium">Lead Credits</span>
            </div>
            <p className="font-display text-xl font-semibold text-gray-900">0</p>
            <p className="text-xs text-gray-400">For marketplace</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="text-xs font-medium text-gray-600 mb-3">Credit Packages</h3>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => onQuickBuyCredits('AI', 50)} className="border border-gray-200 rounded bg-white hover:border-gray-300 p-3 text-center cursor-pointer transition-colors">
              <p className="font-display text-sm font-semibold text-gray-900">50 AI</p>
              <p className="text-xs text-gray-400">$9.99</p>
            </button>
            <button onClick={() => onQuickBuyCredits('EMAIL', 500)} className="border border-gray-200 rounded bg-white hover:border-gray-300 p-3 text-center cursor-pointer transition-colors">
              <p className="font-display text-sm font-semibold text-gray-900">500 Email</p>
              <p className="text-xs text-gray-400">$14.99</p>
            </button>
            <button onClick={() => onQuickBuyCredits('LEAD', 10)} className="border border-gray-200 rounded bg-white hover:border-gray-300 p-3 text-center cursor-pointer transition-colors">
              <p className="font-display text-sm font-semibold text-gray-900">10 Lead</p>
              <p className="text-xs text-gray-400">$19.99</p>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div>
        <h2 className="font-display text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Crown className="h-4 w-4 text-gray-600" /> Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subscriptionData.plans.map((plan) => (
            <div
              key={plan.name}
              className={`border border-gray-200 rounded bg-white p-5 ${
                plan.current ? 'ring-2 ring-gray-900' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-gray-900">{plan.name}</h3>
                {plan.current && (
                  <span className="text-xs bg-gray-900 text-white px-2.5 py-1 rounded">Current</span>
                )}
              </div>
              <div className="mb-5">
                <span className="font-display text-2xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-sm text-gray-400">/mo</span>
              </div>
              <ul className="space-y-2.5 mb-5 text-sm">
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="h-4 w-4 text-gray-600" />
                  {plan.limits.properties === -1 ? 'Unlimited' : plan.limits.properties} properties
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="h-4 w-4 text-gray-600" />
                  {plan.limits.leads === -1 ? 'Unlimited' : plan.limits.leads} leads
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="h-4 w-4 text-gray-600" />
                  {plan.limits.documents === -1 ? 'Unlimited' : plan.limits.documents} documents
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="h-4 w-4 text-gray-600" />
                  {plan.limits.teamMembers === -1 ? 'Unlimited' : plan.limits.teamMembers} team member{plan.limits.teamMembers !== 1 ? 's' : ''}
                </li>
              </ul>
              {!plan.current && (
                <button
                  onClick={() => onUpgradePlan(plan.name)}
                  disabled={upgrading}
                  className={`w-full py-2.5 rounded text-sm font-medium transition-all cursor-pointer ${
                    plan.name === 'PROFESSIONAL'
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  } disabled:opacity-50`}
                >
                  {upgrading ? 'Processing...' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Section */}
      <div className="border border-gray-200 rounded bg-white p-6">
        <h2 className="font-display text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Shield className="h-4 w-4 text-gray-600" /> Security
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-900">Password</p>
              <p className="text-xs text-gray-400">Last changed: Never</p>
            </div>
            <button
              onClick={onChangePassword}
              className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Change
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-gray-900">Two-Factor Authentication</p>
              <p className="text-xs text-gray-400">Add an extra layer of security</p>
            </div>
            <span className="text-xs text-gray-400">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}
