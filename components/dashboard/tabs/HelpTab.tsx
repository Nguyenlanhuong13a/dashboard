'use client'

import { Mail, MessageCircle, BookOpen, HelpCircle, ChevronRight } from 'lucide-react'

interface HelpTabProps {
  currentPlan?: string
  onNavigateToSettings: () => void
}

const FAQ_ITEMS = [
  { q: 'How do I add a new property?', a: 'Go to Properties tab and click "Add Property" button to fill in the property details.' },
  { q: 'How do I track my leads?', a: 'Navigate to Leads tab to view, add, and manage your client leads with status tracking.' },
  { q: 'Can I export my data?', a: 'Yes, Professional and Enterprise plans include data export features.' },
  { q: 'How do I upgrade my plan?', a: 'Go to Settings and select a plan that fits your needs. Payment is processed securely.' },
  { q: 'What happens when I reach my limit?', a: 'You will be prompted to upgrade your plan to add more items.' },
]

export function HelpTab({ currentPlan, onNavigateToSettings }: HelpTabProps) {
  return (
    <div className="space-y-6">
      {/* Quick Help */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="mailto:support@realestatepro.com" className="glass-card-hover p-6">
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-primary-dark mb-1">Email Support</h3>
          <p className="text-sm text-primary-dark/60">Get help via email within 24 hours</p>
        </a>
        <div className="glass-card p-6">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-primary-dark mb-1">Live Chat</h3>
          <p className="text-sm text-primary-dark/60">Chat with our team (Pro plans)</p>
          {currentPlan === 'FREE' && (
            <button onClick={onNavigateToSettings} className="mt-3 text-xs text-primary hover:text-primary-light cursor-pointer">
              Upgrade to access
            </button>
          )}
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-primary-dark mb-1">Documentation</h3>
          <p className="text-sm text-primary-dark/60">Browse guides and tutorials</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="glass-card p-6">
        <h2 className="font-display text-sm font-semibold text-primary-dark mb-5 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" /> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {FAQ_ITEMS.map((faq, i) => (
            <details key={i} className="group">
              <summary className="flex items-center justify-between py-3 px-4 rounded-xl cursor-pointer text-sm text-primary-dark hover:bg-primary/5 transition-colors">
                {faq.q}
                <ChevronRight className="h-4 w-4 text-primary/40 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-sm text-primary-dark/60 px-4 pb-3">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-8 text-white">
        <h3 className="font-display text-lg font-semibold mb-2">Need more help?</h3>
        <p className="text-sm text-white/80 mb-5">Our support team is here to help you succeed.</p>
        <a href="mailto:support@realestatepro.com" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
          <Mail className="h-4 w-4" /> Contact Support
        </a>
      </div>
    </div>
  )
}
