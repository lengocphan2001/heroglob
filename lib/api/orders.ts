import { api } from '../api';

export type CreateOrderPayload = {
  productId: number;
  walletAddress: string;
  tokenType: 'usdt' | 'hero';
  amount: string;
  txHash?: string | null;
};

export async function createOrder(payload: CreateOrderPayload): Promise<{ id: number }> {
  return api<{ id: number }>('orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
