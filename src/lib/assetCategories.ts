import type { LucideIcon } from 'lucide-react';
import {
  Watch,
  Gem,
  Briefcase,
  Footprints,
  Shirt,
  Palette,
  Layers3,
  Trophy,
  Laptop,
  Gamepad2,
  Guitar,
  Wine,
  Car,
  Home,
  Wrench,
  Package,
  Heart,
  TrendingUp,
  Tag,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// WHY you own it — the most important dimension for tracking value
// ─────────────────────────────────────────────────────────────────────────────

export type AssetIntent = 'personal' | 'investment' | 'resale';

export interface IntentDef {
  key: AssetIntent;
  label: string;
  short: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgClass: string;
  borderClass: string;
}

export const ASSET_INTENTS: IntentDef[] = [
  {
    key: 'personal',
    label: 'Personal',
    short: 'Personal',
    description: 'You own and use it. Counts toward net worth.',
    icon: Heart,
    color: '#22F0FF',
    bgClass: 'bg-accent-dim',
    borderClass: 'border-accent',
  },
  {
    key: 'investment',
    label: 'Investment',
    short: 'Investment',
    description: 'Bought to hold and appreciate over time.',
    icon: TrendingUp,
    color: '#B79CFF',
    bgClass: 'bg-purple-dim',
    borderClass: 'border-purple',
  },
  {
    key: 'resale',
    label: 'For Resale',
    short: 'Resale',
    description: 'Inventory you intend to flip for profit.',
    icon: Tag,
    color: '#FFC24D',
    bgClass: 'bg-amber-dim',
    borderClass: 'border-amber',
  },
];

export function getIntent(key: string): IntentDef {
  return ASSET_INTENTS.find((i) => i.key === key) ?? ASSET_INTENTS[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// WHAT it is — broad coverage, nothing niche-specific
// ─────────────────────────────────────────────────────────────────────────────

export interface AssetCategoryDef {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgClass: string;
  /** Optional hint to help the user find a fair market value */
  hint?: string;
}

export const ASSET_CATEGORIES: AssetCategoryDef[] = [
  { key: 'Watches',      label: 'Watches',     icon: Watch,      color: '#22F0FF', bgClass: 'bg-[#22F0FF]/14', hint: 'Chrono24 and WatchCharts list real sale prices' },
  { key: 'Jewelry',      label: 'Jewelry',     icon: Gem,        color: '#B79CFF', bgClass: 'bg-[#B79CFF]/14', hint: 'Get an appraisal, or check comparable listings' },
  { key: 'Bags',         label: 'Bags',        icon: Briefcase,  color: '#F472B6', bgClass: 'bg-[#F472B6]/14', hint: 'Fashionphile and Vestiaire show resale values' },
  { key: 'Sneakers',     label: 'Sneakers',    icon: Footprints, color: '#FF8A3D', bgClass: 'bg-[#FF8A3D]/14', hint: 'StockX and GOAT show live market prices' },
  { key: 'Fashion',      label: 'Fashion',     icon: Shirt,      color: '#FB923C', bgClass: 'bg-[#FB923C]/14', hint: 'Grailed and Vinted for resale comparables' },
  { key: 'Art',          label: 'Art',         icon: Palette,    color: '#FF5C77', bgClass: 'bg-[#FF5C77]/14', hint: 'Check auction records for the artist' },
  { key: 'Cards',        label: 'Cards',       icon: Layers3,    color: '#FFC24D', bgClass: 'bg-[#FFC24D]/14', hint: 'TCGplayer, PSA, or eBay sold listings' },
  { key: 'Collectibles', label: 'Collectibles',icon: Trophy,     color: '#FBBF24', bgClass: 'bg-[#FBBF24]/14', hint: 'eBay sold listings are the best signal' },
  { key: 'Electronics',  label: 'Electronics', icon: Laptop,     color: '#22E88A', bgClass: 'bg-[#22E88A]/14', hint: 'Check trade-in or refurb prices' },
  { key: 'Gaming',       label: 'Gaming',      icon: Gamepad2,   color: '#4ADE80', bgClass: 'bg-[#4ADE80]/14' },
  { key: 'Instruments',  label: 'Instruments', icon: Guitar,     color: '#38BDF8', bgClass: 'bg-[#38BDF8]/14', hint: 'Reverb shows real instrument sale prices' },
  { key: 'Wine',         label: 'Wine',        icon: Wine,       color: '#C084FC', bgClass: 'bg-[#C084FC]/14', hint: 'Wine-Searcher for current market value' },
  { key: 'Vehicles',     label: 'Vehicles',    icon: Car,        color: '#60A5FA', bgClass: 'bg-[#60A5FA]/14', hint: 'KBB, Edmunds, or local listings' },
  { key: 'Property',     label: 'Property',    icon: Home,       color: '#2DD4BF', bgClass: 'bg-[#2DD4BF]/14', hint: 'Recent comparable sales in the area' },
  { key: 'Equipment',    label: 'Equipment',   icon: Wrench,     color: '#A3A3A3', bgClass: 'bg-[#A3A3A3]/14', hint: 'Tools, gear, machinery' },
  { key: 'Other',        label: 'Other',       icon: Package,    color: '#AEBAD0', bgClass: 'bg-[#AEBAD0]/14' },
];

const FALLBACK: AssetCategoryDef = {
  key: 'Other', label: 'Other', icon: Package, color: '#AEBAD0', bgClass: 'bg-[#AEBAD0]/14',
};

export function getAssetCategory(key: string): AssetCategoryDef {
  return ASSET_CATEGORIES.find((c) => c.key === key) ?? FALLBACK;
}
