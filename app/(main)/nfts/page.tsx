'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowLeft, Grid3x3, ExternalLink } from 'lucide-react';

interface NFT {
  productId: number;
  hashId: string;
  title: string;
  description: string;
  imageUrl: string;
  creatorHandle: string;
  creatorAvatarUrl: string;
  quantity: number;
  nftIds: number[];
  lastPurchased: string;
}

export default function NFTsPage() {
  const router = useRouter();
  const { address } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      router.push('/');
      return;
    }

    fetchNFTs();
  }, [address, router]);

  const fetchNFTs = async () => {
    if (!address) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nfts?walletAddress=${address}`);
      if (res.ok) {
        const data = await res.json();
        setNfts(data);
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-background)] dark:bg-[var(--color-background-dark)]">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-light px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex-1">
            NFTs Của Tôi
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="flex-1 px-4 pb-24 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-primary-wallet)] border-t-transparent"
              aria-hidden
            />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
          </div>
        ) : nfts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-[var(--color-border-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] p-10 text-center shadow-sm">
            <div className="mb-5 flex size-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
              <Grid3x3 className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Chưa có NFT nào
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-[260px]">
              Khám phá thị trường để sưu tập NFT
            </p>
            <button
              onClick={() => router.push('/explore')}
              className="gradient-button flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white shadow-lg shadow-[var(--color-primary-wallet)]/25 transition hover:opacity-95 active:scale-[0.98]"
            >
              <ExternalLink className="h-5 w-5" />
              Khám Phá Thị Trường
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {nfts.map((nft) => (
              <button
                key={nft.productId}
                type="button"
                onClick={() => router.push('/explore')}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-[var(--color-border-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] text-left shadow-sm transition hover:shadow-md hover:border-[var(--color-primary-wallet)]/30 active:scale-[0.99]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-white/5">
                  <img
                    src={nft.imageUrl}
                    alt={nft.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  {nft.quantity > 1 && (
                    <div className="absolute top-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      ×{nft.quantity}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {nft.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {nft.creatorAvatarUrl ? (
                      <img
                        src={nft.creatorAvatarUrl}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-[var(--color-primary-wallet)]/20" />
                    )}
                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {nft.creatorHandle || 'Không rõ tác giả'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
