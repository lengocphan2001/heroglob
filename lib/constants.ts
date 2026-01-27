export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/** Địa chỉ ví nhận thanh toán khi user mua sản phẩm (USDT/HERO) */
export const PAYMENT_RECEIVER_ADDRESS =
  process.env.NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS ?? '';
