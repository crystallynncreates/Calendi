import type { CapacitorConfig } from '@capacitor/cli';

// Native app packaging config for iOS (App Store) and Android (Play Store).
// To build native apps after setting up:
//   npm install @capacitor/ios @capacitor/android
//   npm run build
//   npx cap add ios      # then open in Xcode: npx cap open ios
//   npx cap add android  # then open in Android Studio: npx cap open android
//   npx cap sync         # sync web build to native projects after changes

const config: CapacitorConfig = {
  appId: 'com.clccreates.calendi',
  appName: 'calendi',
  webDir: 'dist',
  ios: {
    backgroundColor: '#06060F',
    contentInset: 'always',
    preferredContentMode: 'mobile',
  },
  android: {
    backgroundColor: '#06060F',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#06060F',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#06060F',
    },
  },
};

export default config;
