/**
 * Encode ERC20 transfer(to, value) và gửi qua window.ethereum.
 */

const TRANSFER_SELECTOR = '0xa9059cbb'; // transfer(address,uint256)

function padAddress(addr: string): string {
  const a = addr.startsWith('0x') ? addr.slice(2) : addr;
  return a.padStart(64, '0');
}

function padUint256(n: bigint): string {
  return n.toString(16).padStart(64, '0');
}

/**
 * Chuẩn hóa chuỗi số: dấu phẩy → chấm; dạng khoa học "2e-3" → "0.002".
 */
function normalizeAmountString(value: string): string {
  let s = value.trim().replace(/,/g, '.'); // "0,002" → "0.002", không xóa
  if (/[eE]/.test(s)) {
    const n = parseFloat(s);
    if (Number.isNaN(n)) return '0';
    if (n === 0) return '0';
    s = n.toFixed(18).replace(/\.?0+$/, '');
  }
  return s;
}

/**
 * Chuyển số dạng "0.002" thành raw bigint theo decimals của token.
 * VD: "0.002" + 6 → 2000n (ERC-20 USDT); "0.002" + 18 → 2000000000000000n (BSC BEP-20 USDT).
 */
export function toRawAmount(humanAmount: string, decimals: number): bigint {
  if (humanAmount == null || String(humanAmount).trim() === '' || humanAmount === '0') return 0n;
  const s = normalizeAmountString(String(humanAmount));
  if (s === '0') return 0n;
  const [intPart = '0', fracPart = ''] = s.split('.');
  const frac = fracPart.slice(0, decimals).padEnd(decimals, '0');
  const combined = (intPart === '0' || intPart === '') && fracPart ? frac : intPart.replace(/^0+/, '') + frac;
  const clean = combined.replace(/^0+/, '') || '0';
  return BigInt(clean);
}

export function encodeTransfer(toAddress: string, rawAmount: bigint): string {
  return TRANSFER_SELECTOR + padAddress(toAddress) + padUint256(rawAmount);
}

export async function sendTokenTransfer(
  ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> },
  fromAddress: string,
  tokenAddress: string,
  toAddress: string,
  rawAmount: bigint,
): Promise<string> {
  const data = encodeTransfer(toAddress, rawAmount);
  const result = (await ethereum.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: fromAddress,
        to: tokenAddress,
        data,
        value: '0x0',
      },
    ],
  })) as string;
  return result;
}
