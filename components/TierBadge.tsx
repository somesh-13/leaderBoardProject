interface TierBadgeProps {
  tier: 'S' | 'A' | 'B' | 'C'
  className?: string
}

export default function TierBadge({ tier, className = '' }: TierBadgeProps) {
  const tierConfig = {
    S: 'tier-s',
    A: 'tier-a', 
    B: 'tier-b',
    C: 'tier-c'
  }

  return (
    <span className={`tier-badge ${tierConfig[tier]} ${className}`}>
      {tier} Tier
    </span>
  )
}