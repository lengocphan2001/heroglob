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
  if (humanAmount == null || String(humanAmount).trim() === '' || humanAmount === '0') return BigInt(0);
  const s = normalizeAmountString(String(humanAmount));
  if (s === '0') return BigInt(0);
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

export async function waitForTransaction(
  ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> },
  txHash: string,
): Promise<void> {
  const maxRetries = 60; // 60 * 2s = 2 minutes max
  for (let i = 0; i < maxRetries; i++) {
    const receipt = (await ethereum.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    })) as { status: string } | null;

    if (receipt) {
      if (receipt.status === '0x1') {
        return; // Success
      } else {
        throw new Error('Transaction failed on-chain');
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error('Transaction confirmation timed out');
}

export async function checkBalance(
  ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> },
  walletAddress: string,
  tokenAddress: string,
  requiredRawAmount: bigint,
): Promise<void> {
  const BALANCE_SELECTOR = '0x70a08231'; // balanceOf(address)
  const data = BALANCE_SELECTOR + padAddress(walletAddress);

  try {
    const hexBalance = (await ethereum.request({
      method: 'eth_call',
      params: [
        {
          to: tokenAddress,
          data,
        },
        'latest',
      ],
    })) as string;

    const balance = BigInt(hexBalance);

    if (balance < requiredRawAmount) {
      // Estimate decimals to show friendly error (assuming 18 for BSC/Default, 6 for others? We don't have chainId here easily).
      // But we can just show raw / 10^18 approx.
      // Or just say "Has approx X (Raw: Y)"
      const friendlyBalance = (Number(balance) / 1e18).toFixed(18).replace(/\.?0+$/, '');
      const friendlyNeeded = (Number(requiredRawAmount) / 1e18).toFixed(18).replace(/\.?0+$/, '');

      throw new Error(`Insufficient balance. You have ${friendlyBalance} (Raw: ${balance}), but need ${friendlyNeeded}. Please ensure you have USDT on BSC (BEP20).`);
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Insufficient balance')) {
      throw err;
    }
    console.error('Failed to check balance:', err);
    // If we can't check balance (e.g. RPC error), we might want to let the wallet try ensuring the tx?
    // But user asked to "make it clear".
    // Let's wrap the error to be visible.
    throw new Error(`Could not verify balance (RPC Error): ${err.message || 'Unknown'}`);
  }
}
