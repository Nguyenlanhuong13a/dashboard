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
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-sm font-semibold text-primary-dark flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Profile
          </h2>
          <div className="flex items-center gap-2 text-xs">
            {profileSaving && (
              <span className="flex items-center gap-1 text-primary-dark/50">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving...
              </span>
            )}
            {profileSaved && !profileSaving && (
              <span className="flex items-center gap-1 text-primary">
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
          </div>
        </div>

        {profileError && (
          <div className="mb-5 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl flex items-start gap-2">
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
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/50 shadow-soft"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-2 border-primary/20 flex items-center justify-center text-primary text-2xl font-display font-medium bg-primary/5">
                  {profileForm.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 rounded-2xl bg-primary-dark/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
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
                className="text-xs text-primary hover:text-primary-light transition-colors cursor-pointer"
              >
                {user.image ? 'Change' : 'Upload'}
              </button>
              {user.image && (
                <>
                  <span className="text-primary-dark/20">|</span>
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
              <label htmlFor="profile-name" className="block text-xs text-primary-dark/60 mb-1.5">
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
              <label htmlFor="profile-email" className="block text-xs text-primary-dark/60 mb-1.5">
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 text-primary-dark/50 cursor-not-allowed"
              />
              <p className="text-xs text-primary-dark/40 mt-1">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-phone" className="block text-xs text-primary-dark/60 mb-1.5 flex items-center gap-1">
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
                <label htmlFor="profile-license" className="block text-xs text-primary-dark/60 mb-1.5 flex items-center gap-1">
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

            <div className="pt-2 flex items-center gap-4 text-xs text-primary-dark/40">
              <span>Role: <span className="text-primary-dark/70 font-medium">{user.role}</span></span>
              <span>•</span>
              <span>Changes save automatically</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Plan & Usage */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-sm font-semibold text-primary-dark flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Current Plan
          </h2>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            subscriptionData.subscription.plan === 'FREE' ? 'bg-primary-dark/5 text-primary-dark/70' :
            subscriptionData.subscription.plan === 'STARTER' ? 'bg-primary/10 text-primary' :
            subscriptionData.subscription.plan === 'PROFESSIONAL' ? 'bg-accent/10 text-accent' :
            'bg-accent-gold/10 text-accent-gold'
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
          <div className="p-4 bg-accent-gold/10 border border-accent-gold/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-primary-dark font-medium">Upgrade to unlock more features</p>
              <p className="text-xs text-primary-dark/60 mt-0.5">Get more properties, leads, and advanced analytics</p>
            </div>
          </div>
        )}
      </div>

      {/* Credits Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-sm font-semibold text-primary-dark flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Credits
          </h2>
          <button onClick={onBuyCredits} className="text-xs text-primary hover:text-primary-light font-medium cursor-pointer">
            Buy More
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-primary/5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-xs text-primary-dark/70 font-medium">AI Credits</span>
            </div>
            <p className="font-display text-xl font-semibold text-primary-dark">0</p>
            <p className="text-xs text-primary-dark/50">For lead scoring</p>
          </div>
          <div className="p-4 bg-primary/5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-xs text-primary-dark/70 font-medium">Email Credits</span>
            </div>
            <p className="font-display text-xl font-semibold text-primary-dark">0</p>
            <p className="text-xs text-primary-dark/50">For campaigns</p>
          </div>
          <div className="p-4 bg-primary/5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs text-primary-dark/70 font-medium">Lead Credits</span>
            </div>
            <p className="font-display text-xl font-semibold text-primary-dark">0</p>
            <p className="text-xs text-primary-dark/50">For marketplace</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-primary/5 rounded-xl">
          <h3 className="text-xs font-medium text-primary-dark/70 mb-3">Credit Packages</h3>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => onQuickBuyCredits('AI', 50)} className="glass-card-hover p-3 text-center">
              <p className="font-display text-sm font-semibold text-primary-dark">50 AI</p>
              <p className="text-xs text-primary-dark/50">$9.99</p>
            </button>
            <button onClick={() => onQuickBuyCredits('EMAIL', 500)} className="glass-card-hover p-3 text-center">
              <p className="font-display text-sm font-semibold text-primary-dark">500 Email</p>
              <p className="text-xs text-primary-dark/50">$14.99</p>
            </button>
            <button onClick={() => onQuickBuyCredits('LEAD', 10)} className="glass-card-hover p-3 text-center">
              <p className="font-display text-sm font-semibold text-primary-dark">10 Lead</p>
              <p className="text-xs text-primary-dark/50">$19.99</p>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div>
        <h2 className="font-display text-sm font-semibold text-primary-dark mb-5 flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" /> Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subscriptionData.plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card p-5 ${
                plan.current ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-primary-dark">{plan.name}</h3>
                {plan.current && (
                  <span className="text-xs bg-primary text-white px-2.5 py-1 rounded-lg">Current</span>
                )}
              </div>
              <div className="mb-5">
                <span className="font-display text-2xl font-bold text-primary-dark">${plan.price}</span>
                <span className="text-sm text-primary-dark/50">/mo</span>
              </div>
              <ul className="space-y-2.5 mb-5 text-sm">
                <li className="flex items-center gap-2 text-primary-dark/70">
                  <Check className="h-4 w-4 text-primary" />
                  {plan.limits.properties === -1 ? 'Unlimited' : plan.limits.properties} properties
                </li>
                <li className="flex items-center gap-2 text-primary-dark/70">
                  <Check className="h-4 w-4 text-primary" />
                  {plan.limits.leads === -1 ? 'Unlimited' : plan.limits.leads} leads
                </li>
                <li className="flex items-center gap-2 text-primary-dark/70">
                  <Check className="h-4 w-4 text-primary" />
                  {plan.limits.documents === -1 ? 'Unlimited' : plan.limits.documents} documents
                </li>
                <li className="flex items-center gap-2 text-primary-dark/70">
                  <Check className="h-4 w-4 text-primary" />
                  {plan.limits.teamMembers === -1 ? 'Unlimited' : plan.limits.teamMembers} team member{plan.limits.teamMembers !== 1 ? 's' : ''}
                </li>
              </ul>
              {!plan.current && (
                <button
                  onClick={() => onUpgradePlan(plan.name)}
                  disabled={upgrading}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    plan.name === 'PROFESSIONAL'
                      ? 'btn-primary'
                      : 'bg-primary/5 text-primary hover:bg-primary/10'
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
      <div className="glass-card p-6">
        <h2 className="font-display text-sm font-semibold text-primary-dark mb-5 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" /> Security
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-primary/5">
            <div>
              <p className="text-sm text-primary-dark">Password</p>
              <p className="text-xs text-primary-dark/50">Last changed: Never</p>
            </div>
            <button
              onClick={onChangePassword}
              className="text-sm text-primary border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
            >
              Change
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-primary-dark">Two-Factor Authentication</p>
              <p className="text-xs text-primary-dark/50">Add an extra layer of security</p>
            </div>
            <span className="text-xs text-primary-dark/40">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}
