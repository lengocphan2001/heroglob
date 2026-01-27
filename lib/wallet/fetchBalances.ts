/**
 * Gọi RPC qua window.ethereum (eth_call, eth_getBalance).
 * Không dùng thư viện bên ngoài.
 */

const BALANCE_OF_SELECTOR = '0x70a08231'; // balanceOf(address)
const DECIMALS_SELECTOR = '0x313ce567';   // decimals()

function padAddress(addr: string): string {
  const a = addr.startsWith('0x') ? addr.slice(2) : addr;
  return a.padStart(64, '0');
}

function encodeBalanceOf(userAddress: string): string {
  return BALANCE_OF_SELECTOR + padAddress(userAddress);
}

/** Parse 32 bytes hex (64 hex chars) thành bigint */
function parseUint256(hex: string): bigint {
  if (!hex || hex === '0x') return 0n;
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  const slice = h.slice(0, 64).padStart(64, '0');
  return BigInt('0x' + slice);
}

export async function fetchTokenBalance(
  ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> },
  tokenAddress: string,
  userAddress: string,
  decimals: number,
): Promise<bigint> {
  const data = encodeBalanceOf(userAddress);
  const result = (await ethereum.request({
    method: 'eth_call',
    params: [{ to: tokenAddress, data }, 'latest'],
  })) as string;
  const raw = parseUint256(result);
  return raw;
}

export async function fetchTokenDecimals(
  ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> },
  tokenAddress: string,
): Promise<number> {
  const result = (await ethereum.request({
    method: 'eth_call',
    params: [{ to: tokenAddress, data: DECIMALS_SELECTOR }, 'latest'],
  })) as string;
  const n = parseUint256(result);
  return Number(n);
}

export async function fetchNativeBalance(
  ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> },
  userAddress: string,
): Promise<bigint> {
  const result = (await ethereum.request({
    method: 'eth_getBalance',
    params: [userAddress, 'latest'],
  })) as string;
  return BigInt(result || '0');
}

/** Format số dư token, tối đa 4 chữ số thập phân */
export function formatTokenAmount(raw: bigint, decimals: number, maxDecimals = 4): string {
  if (raw === 0n) return '0';
  const div = 10 ** decimals;
  const intPart = raw / BigInt(div);
  const fracPart = raw % BigInt(div);
  const fracFull = fracPart.toString().padStart(decimals, '0').slice(0, decimals);
  const frac = fracFull.slice(0, maxDecimals).replace(/0+$/, '') || '0';
  if (frac === '0') return intPart.toString();
  return `${intPart}.${frac}`;
}

export function formatNativeAmount(wei: bigint): string {
  return formatTokenAmount(wei, 18);
}
