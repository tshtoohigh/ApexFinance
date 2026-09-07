import type { LucideIcon } from 'lucide-react';
import {
  UtensilsCrossed,
  Coffee,
  ShoppingCart,
  Car,
  Home,
  Clapperboard,
  HeartPulse,
  ShoppingBag,
  Plane,
  Gift,
  Zap,
  Wallet,
  Banknote,
  ArrowLeftRight,
  MoreHorizontal,
} from 'lucide-react';

export interface CategoryDef {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;   // hex — used for icon + bar accents
  bgClass: string; // tailwind bg tint class for tiles
}

/**
 * Central category config. Used by quick-tap tiles, transaction lists,
 * and the spending breakdown so colors/icons are consistent everywhere.
 */
export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { key: 'Food',          label: 'Food',       icon: UtensilsCrossed, color: '#FF8A3D', bgClass: 'bg-[#FF8A3D]/12' },
  { key: 'Coffee',        label: 'Coffee',     icon: Coffee,          color: '#B8825A', bgClass: 'bg-[#B8825A]/12' },
  { key: 'Groceries',     label: 'Groceries',  icon: ShoppingCart,    color: '#00E68A', bgClass: 'bg-[#00E68A]/12' },
  { key: 'Transport',     label: 'Transport',  icon: Car,             color: '#00F0FF', bgClass: 'bg-[#00F0FF]/12' },
  { key: 'Rent',          label: 'Rent/Bills', icon: Home,            color: '#FF4D6A', bgClass: 'bg-[#FF4D6A]/12' },
  { key: 'Entertainment', label: 'Fun',        icon: Clapperboard,    color: '#A78BFA', bgClass: 'bg-[#A78BFA]/12' },
  { key: 'Health',        label: 'Health',     icon: HeartPulse,      color: '#4ADE80', bgClass: 'bg-[#4ADE80]/12' },
  { key: 'Shopping',      label: 'Shopping',   icon: ShoppingBag,     color: '#F472B6', bgClass: 'bg-[#F472B6]/12' },
  { key: 'Travel',        label: 'Travel',     icon: Plane,           color: '#38BDF8', bgClass: 'bg-[#38BDF8]/12' },
  { key: 'Gifts',         label: 'Gifts',      icon: Gift,            color: '#FBBF24', bgClass: 'bg-[#FBBF24]/12' },
  { key: 'Utilities',     label: 'Utilities',  icon: Zap,             color: '#FFB020', bgClass: 'bg-[#FFB020]/12' },
  { key: 'Other',         label: 'Other',      icon: MoreHorizontal,  color: '#8E9BAE', bgClass: 'bg-[#8E9BAE]/12' },
];

export const INCOME_CATEGORY: CategoryDef = {
  key: 'Income', label: 'Income', icon: Banknote, color: '#00E68A', bgClass: 'bg-[#00E68A]/12',
};

const TRANSFER_CATEGORY: CategoryDef = {
  key: 'Transfer', label: 'Transfer', icon: ArrowLeftRight, color: '#00F0FF', bgClass: 'bg-[#00F0FF]/12',
};

const FALLBACK: CategoryDef = {
  key: 'Other', label: 'Other', icon: Wallet, color: '#8E9BAE', bgClass: 'bg-[#8E9BAE]/12',
};

/** Look up the config for any category key (used to color/icon transactions). */
export function getCategory(key: string): CategoryDef {
  if (key === 'Income') return INCOME_CATEGORY;
  if (key === 'Transfer') return TRANSFER_CATEGORY;
  return EXPENSE_CATEGORIES.find((c) => c.key === key) ?? FALLBACK;
}
