import { api } from './client';

export type SystemConfig = {
    id: number;
    key: string;
    value: string;
};

export const systemApi = {
    getAll: () => api<SystemConfig[]>('/system-config'),
    update: (key: string, value: string) =>
        api<SystemConfig>('/system-config', {
            method: 'POST',
            body: JSON.stringify({ key, value }),
        }),
};
