import type { LucideIcon } from 'lucide-react';
import {
  Footprints,
  Watch,
  Gem,
  Car,
  Home,
  Laptop,
  Palette,
  Trophy,
  Guitar,
  Bike,
  Package,
} from 'lucide-react';

export interface AssetCategoryDef {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgClass: string;
  /** Hint shown in the add form to guide valuation */
  hint?: string;
}

/**
 * Physical / alternative asset categories — things worth money that
 * don't live in a bank account. Enables holistic net worth tracking.
 */
export const ASSET_CATEGORIES: AssetCategoryDef[] = [
  { key: 'Sneakers',     label: 'Sneakers',    icon: Footprints, color: '#FF8A3D', bgClass: 'bg-[#FF8A3D]/14', hint: 'Check StockX / GOAT for market value' },
  { key: 'Watches',      label: 'Watches',     icon: Watch,      color: '#22F0FF', bgClass: 'bg-[#22F0FF]/14', hint: 'Check Chrono24 for market value' },
  { key: 'Jewelry',      label: 'Jewelry',     icon: Gem,        color: '#B79CFF', bgClass: 'bg-[#B79CFF]/14' },
  { key: 'Collectibles', label: 'Collectibles',icon: Trophy,     color: '#FFC24D', bgClass: 'bg-[#FFC24D]/14', hint: 'Cards, figures, memorabilia' },
  { key: 'Electronics',  label: 'Electronics', icon: Laptop,     color: '#22E88A', bgClass: 'bg-[#22E88A]/14' },
  { key: 'Vehicles',     label: 'Vehicles',    icon: Car,        color: '#FF5C77', bgClass: 'bg-[#FF5C77]/14', hint: 'Check resale listings for market value' },
  { key: 'Bikes',        label: 'Bikes',       icon: Bike,       color: '#4ADE80', bgClass: 'bg-[#4ADE80]/14' },
  { key: 'Art',          label: 'Art',         icon: Palette,    color: '#F472B6', bgClass: 'bg-[#F472B6]/14' },
  { key: 'Instruments',  label: 'Instruments', icon: Guitar,     color: '#FB923C', bgClass: 'bg-[#FB923C]/14' },
  { key: 'Property',     label: 'Property',    icon: Home,       color: '#38BDF8', bgClass: 'bg-[#38BDF8]/14' },
  { key: 'Other',        label: 'Other',       icon: Package,    color: '#AEBAD0', bgClass: 'bg-[#AEBAD0]/14' },
];

const FALLBACK: AssetCategoryDef = {
  key: 'Other', label: 'Other', icon: Package, color: '#AEBAD0', bgClass: 'bg-[#AEBAD0]/14',
};

export function getAssetCategory(key: string): AssetCategoryDef {
  return ASSET_CATEGORIES.find((c) => c.key === key) ?? FALLBACK;
}
