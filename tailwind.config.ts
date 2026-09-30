import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Layered surfaces (clear brightness steps for depth/contrast) ───
        bg: '#070A11',          // deepest — the page
        card: '#161E2E',        // clearly lifts off the bg
        'card-hover': '#1F2A3D',
        surface: '#232E43',     // distinct 3rd tier for inner elements/tiles

        // ─── Accent ───
        accent: '#22F0FF',
        'accent-dim': 'rgba(34, 240, 255, 0.14)',
        'accent-mid': 'rgba(34, 240, 255, 0.28)',

        // ─── Status ───
        green: '#22E88A',
        'green-dim': 'rgba(34, 232, 138, 0.15)',
        red: '#FF5C77',
        'red-dim': 'rgba(255, 92, 119, 0.15)',
        amber: '#FFC24D',
        'amber-dim': 'rgba(255, 194, 77, 0.15)',
        purple: '#B79CFF',
        'purple-dim': 'rgba(183, 156, 255, 0.15)',

        // ─── Text (brighter tiers for readability) ───
        muted: '#AEBAD0',       // secondary text — now clearly readable
        'muted-dark': '#6B7A93',// tertiary/labels — lifted from the old dim gray

        // ─── Borders (visible edges) ───
        border: '#2E3B52',
        'border-light': '#3C4C69',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SF Mono', 'Fira Code', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
    },
  },
  plugins: [],
};

export default config;
