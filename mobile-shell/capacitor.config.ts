import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration for Spark mobile.
 *
 * The mobile app wraps a static build produced from `mobile-shell/` —
 * mirroring the Chrome-extension architecture. The web bundle is the
 * single source of truth for components and lib code; the shell just
 * supplies an entry point and a Capacitor-aware runtime branch in
 * lib/chatClient.ts that calls DeepSeek directly with the user's
 * encrypted local key (no server required).
 *
 * To turn this scaffolding into real native projects, run on your dev
 * machine (Xcode 15+ for iOS, Android Studio Hedgehog+ for Android):
 *
 *   npm run mobile:install
 *   npm run mobile:build           # builds mobile-shell/dist
 *   npx cap add android
 *   npx cap add ios
 *   npx cap sync
 *   npx cap run android            # or ios
 */
const config: CapacitorConfig = {
  appId: "app.getspark.mobile",
  appName: "Spark",
  webDir: "dist",
  backgroundColor: "#FAF9F5",
  // Keep navigation pinned to file:// so the privacy posture stays the same
  // as the web build. Capacitor serves the local bundle from a synthetic
  // origin so localStorage, WebCrypto, and the existing keystore all work.
  server: {
    androidScheme: "https",
  },
  ios: {
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: true,
    preferredContentMode: "mobile",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: "#FAF9F5",
      androidSplashResourceName: "splash",
      iosSpinnerStyle: "small",
      showSpinner: false,
    },
    Keyboard: {
      resize: "ionic",
    },
  },
};

export default config;
