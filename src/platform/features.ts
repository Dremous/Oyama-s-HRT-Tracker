import { isAndroidApp } from './env';

const androidMode = isAndroidApp();

export const featureFlags = {
    account: !androidMode,
    cloudSync: !androidMode,
    admin: !androidMode,
};
