import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dominionassistant.app',
  appName: 'Unofficial Dominion Assistant', // Use correct display name
  webDir: 'dist/dominion-assistant', // Point to the actual Nx build output
  // bundledWebRuntime: false, // Removed invalid property
  server: {
    androidScheme: 'https',
    cleartext: true,
    iosScheme: 'capacitor',
  },
  ios: {
    path: 'ios/App', // Point to the directory containing the renamed .xcodeproj
    loggingBehavior: 'none',
  },
};

export default config;
