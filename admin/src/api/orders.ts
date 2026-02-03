import { api } from './client';

export type Order = {
  id: number;
  productId: number;
  product?: { id: number; hashId: string | null; title: string } | null;
  walletAddress: string;
  tokenType: string;
  amount: string;
  txHash: string | null;
  status: string;
  createdAt: string;
};

export function getOrders(): Promise<Order[]> {
  return api<Order[]>('orders/admin/all'); // Updated to admin route
}

export function updateOrderStatus(id: number, status: string): Promise<Order> {
  return api<Order>('orders/admin/status', {
    method: 'POST',
    body: JSON.stringify({ id, status }),
  });
}

export function getUserOrders(wallet: string): Promise<any[]> {
  return api<any[]>(`orders/user/${wallet}`);
}
