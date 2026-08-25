import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0F1D',
        card: '#141C2E',
        'card-hover': '#1A2438',
        surface: '#0F1525',
        accent: '#00F0FF',
        'accent-dim': 'rgba(0, 240, 255, 0.12)',
        'accent-mid': 'rgba(0, 240, 255, 0.25)',
        green: '#00E68A',
        'green-dim': 'rgba(0, 230, 138, 0.12)',
        red: '#FF4D6A',
        'red-dim': 'rgba(255, 77, 106, 0.12)',
        amber: '#FFB020',
        'amber-dim': 'rgba(255, 176, 32, 0.12)',
        purple: '#A78BFA',
        'purple-dim': 'rgba(167, 139, 250, 0.12)',
        muted: '#8E9BAE',
        'muted-dark': '#4A5568',
        border: '#1E293B',
        'border-light': '#2D3748',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
