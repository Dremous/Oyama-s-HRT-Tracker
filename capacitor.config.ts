import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.oyama.hrttracker',
    appName: 'HRT Tracker',
    webDir: 'dist',
    bundledWebRuntime: false,
    android: {
        allowMixedContent: false,
        backgroundColor: '#ffffff',
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 0,
            backgroundColor: '#ffffff',
        },
    },
};

export default config;
