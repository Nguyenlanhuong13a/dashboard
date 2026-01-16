'use client'

interface UsageBarProps {
  label: string
  current: number
  limit: number
}

export function UsageBar({ label, current, limit }: UsageBarProps) {
  const percentage = limit === -1 ? 0 : Math.min((current / limit) * 100, 100)
  const isNearLimit = limit !== -1 && percentage >= 80
  const isAtLimit = limit !== -1 && current >= limit

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-primary-dark/70">{label}</span>
        <span className={isAtLimit ? 'text-primary font-medium' : 'text-primary-dark/50'}>
          {current} / {limit === -1 ? '∞' : limit}
        </span>
      </div>
      <div className="h-2 bg-primary/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAtLimit ? 'bg-accent-gold' : isNearLimit ? 'bg-accent' : 'bg-primary'
          }`}
          style={{ width: limit === -1 ? '0%' : `${percentage}%` }}
        />
      </div>
      {isAtLimit && <p className="text-xs text-accent-gold mt-1.5">Limit reached</p>}
    </div>
  )
}
