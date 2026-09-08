import { cn } from '@/lib/cn';

interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * The RS Finance logo — a growth-bar motif with an "RS" monogram.
 * Consistent, professional brand mark used on auth + onboarding.
 */
export function BrandMark({ size = 64, className }: BrandMarkProps) {
  return (
    <div
      className={cn('relative flex items-center justify-center rounded-2xl', className)}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #0F1525 0%, #0A0F1D 100%)',
        boxShadow: '0 8px 24px rgba(0,240,255,0.12), inset 0 0 0 1px rgba(0,240,255,0.18)',
      }}
    >
      <svg viewBox="0 0 64 64" width={size * 0.7} height={size * 0.7} fill="none">
        {/* growth bars */}
        <g opacity="0.9">
          <rect x="20" y="38" width="5" height="12" rx="2" fill="#00F0FF" fillOpacity="0.35" />
          <rect x="29" y="31" width="5" height="19" rx="2" fill="#00F0FF" fillOpacity="0.55" />
          <rect x="38" y="24" width="5" height="26" rx="2" fill="#00F0FF" fillOpacity="0.8" />
        </g>
        <text
          x="32" y="30" textAnchor="middle"
          fontFamily="-apple-system, 'Segoe UI', sans-serif"
          fontSize="26" fontWeight="800" letterSpacing="-1" fill="#5CF6FF"
        >
          RS
        </text>
      </svg>
    </div>
  );
}
