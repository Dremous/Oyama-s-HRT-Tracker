import { isAndroidApp } from '../platform/env';

export interface ExportFilePayload {
    filename: string;
    mimeType: string;
    content: string;
}

export interface ExportBlobPayload {
    filename: string;
    mimeType: string;
    blob: Blob;
    fallbackText?: string;
}

const downloadBlobWithAnchor = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

export const copyTextToClipboard = async (text: string): Promise<void> => {
    if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API is unavailable');
    }

    await navigator.clipboard.writeText(text);
};

export const exportTextFile = async (payload: ExportFilePayload): Promise<'download' | 'clipboard'> => {
    if (typeof document !== 'undefined') {
        try {
            const blob = new Blob([payload.content], { type: payload.mimeType });
            downloadBlobWithAnchor(blob, payload.filename);
            return 'download';
        } catch (error) {
            if (!isAndroidApp()) {
                throw error;
            }
        }
    }

    await copyTextToClipboard(payload.content);
    return 'clipboard';
};

export const exportBlobFile = async (payload: ExportBlobPayload): Promise<'download' | 'clipboard'> => {
    if (typeof document !== 'undefined') {
        try {
            downloadBlobWithAnchor(payload.blob, payload.filename);
            return 'download';
        } catch (error) {
            if (!isAndroidApp() || !payload.fallbackText) {
                throw error;
            }
        }
    }

    if (!payload.fallbackText) {
        throw new Error('Blob export fallback text is unavailable');
    }

    await copyTextToClipboard(payload.fallbackText);
    return 'clipboard';
};
