import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apexfinance.app',
  appName: 'Apex Finance',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  backgroundColor: '#0A0F1D',
};

export default config;
