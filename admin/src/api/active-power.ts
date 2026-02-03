import { api } from './client';

export type ActivePowerPackage = {
    id: number;
    name: string;
    price: string;
    dailyProfitPercent: string;
    durationDays: number;
    isActive: boolean;
};

export const getPackages = () => api<ActivePowerPackage[]>('/active-power/admin', { method: 'GET' });
export const createPackage = (data: Partial<ActivePowerPackage>) => api<ActivePowerPackage>('/active-power', { method: 'POST', body: JSON.stringify(data) });
export const updatePackage = (id: number, data: Partial<ActivePowerPackage>) => api<ActivePowerPackage>(`/active-power/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deletePackage = (id: number) => api(`/active-power/${id}`, { method: 'DELETE' });
