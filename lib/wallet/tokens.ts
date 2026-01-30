/** USDT contract address theo chainId (Ethereum, BSC, Polygon, ...) */
export const USDT_BY_CHAIN: Record<string, string> = {
  '1': '0xdAC17F958D2ee523a2206206994597C13D831ec7',   // Ethereum
  '56': '0x55d398326f99059fF775485246999027B3197955',  // BSC (Binance-Peg)
  '137': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon
  '42161': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum
  '10': '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',  // Optimism
};

/** USDT decimals theo chain: BSC BEP-20 dùng 18, Ethereum ERC-20 thường dùng 6 */
export const USDT_DECIMALS_BY_CHAIN: Record<string, number> = {
  '1': 6,
  '56': 18,   // BSC Binance-Peg USDT
  '137': 6,
  '42161': 6,
  '10': 6,
};

/** Hero token contract (địa chỉ do dự án cung cấp) */
export const HERO_TOKEN_ADDRESS = '0x15E7ca18F73574112A5fd1d29c93cec0B42C1AAD';

export const HERO_TOKEN = {
  address: HERO_TOKEN_ADDRESS,
  symbol: 'HERO',
  name: 'Hero Coin',
  decimals: 18,
  iconUrl: '/icons/hero-coin.svg',
} as const;

/** Native token symbol theo chainId */
export const NATIVE_SYMBOL_BY_CHAIN: Record<string, string> = {
  '1': 'ETH',
  '56': 'BNB',
  '137': 'MATIC',
  '42161': 'ETH',
  '10': 'ETH',
};

/** Nhãn mạng để hiển thị (BEP20, ERC20, ...) */
export const NETWORK_LABEL_BY_CHAIN: Record<string, string> = {
  '1': 'ERC20',
  '56': 'BEP20',
  '137': 'Polygon',
  '42161': 'Arbitrum',
  '10': 'Optimism',
};

export function getUsdtAddress(chainId: string | null): string | null {
  return chainId ? USDT_BY_CHAIN[chainId] ?? null : null;
}

export function getUsdtDecimals(chainId: string | null): number {
  return (chainId ? USDT_DECIMALS_BY_CHAIN[chainId] : undefined) ?? 18;
}

export function getNativeSymbol(chainId: string | null): string {
  return (chainId ? NATIVE_SYMBOL_BY_CHAIN[chainId] : undefined) || 'ETH';
}

export function getNetworkLabel(chainId: string | null): string {
  return (chainId ? NETWORK_LABEL_BY_CHAIN[chainId] : undefined) || 'ERC20';
}

/** BSC (BEP20) – mạng mặc định để hiển thị số dư */
export const BSC_CHAIN_ID = '56';

export const BSC_PARAMS = {
  chainId: '0x38', // 56
  chainName: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: ['https://bsc-dataseed.binance.org/', 'https://bsc-dataseed1.defibit.io/'],
  blockExplorerUrls: ['https://bscscan.com'],
} as const;
