declare global {
    interface Window {
        __TAURI__?: unknown;
        Capacitor?: unknown;
    }
}

export type RuntimePlatform = 'web' | 'tauri' | 'android';

export const isBrowser = (): boolean => typeof window !== 'undefined';

export const isTauriApp = (): boolean => isBrowser() && typeof window.__TAURI__ !== 'undefined';

export const isCapacitorApp = (): boolean => isBrowser() && typeof window.Capacitor !== 'undefined';

export const isAndroidApp = (): boolean => {
    if (!isBrowser()) {
        return false;
    }

    return isCapacitorApp() && /Android/i.test(window.navigator.userAgent);
};

export const getRuntimePlatform = (): RuntimePlatform => {
    if (isTauriApp()) {
        return 'tauri';
    }

    if (isAndroidApp()) {
        return 'android';
    }

    return 'web';
};
