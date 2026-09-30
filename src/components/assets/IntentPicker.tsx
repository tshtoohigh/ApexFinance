import { ASSET_INTENTS, type AssetIntent } from '@/lib/assetCategories';
import { cn } from '@/lib/cn';

interface IntentPickerProps {
  value: AssetIntent;
  onChange: (intent: AssetIntent) => void;
  /** Compact mode hides the description text (used in inline edit) */
  compact?: boolean;
}

/**
 * Segmented control for choosing WHY you own an item.
 * This drives how the asset is grouped and whether ROI is tracked.
 */
export function IntentPicker({ value, onChange, compact }: IntentPickerProps) {
  const active = ASSET_INTENTS.find((i) => i.key === value) ?? ASSET_INTENTS[0];

  return (
    <div className="mb-3">
      <div className="grid grid-cols-3 gap-2">
        {ASSET_INTENTS.map((intent) => {
          const Icon = intent.icon;
          const isActive = value === intent.key;
          return (
            <button
              key={intent.key}
              type="button"
              onClick={() => onChange(intent.key)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border py-2.5 transition-all',
                isActive
                  ? `${intent.borderClass} ${intent.bgClass}`
                  : 'border-border bg-surface hover:border-border-light'
              )}
            >
              <Icon size={15} style={{ color: isActive ? intent.color : '#6B7A93' }} />
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? intent.color : '#6B7A93' }}
              >
                {intent.short}
              </span>
            </button>
          );
        })}
      </div>
      {!compact && (
        <p className="mt-2 text-[10px] leading-snug text-muted-dark">{active.description}</p>
      )}
    </div>
  );
}
