'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowLeft, Grid3x3 } from 'lucide-react';

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
        <div className="relative mx-auto flex max-w-md flex-col bg-white min-h-screen pb-24">
            {/* Top App Bar */}
            <div className="sticky top-0 z-20 flex items-center bg-white/95 backdrop-blur-md p-4 pb-2 justify-between">
                <button onClick={() => router.back()} className="text-slate-900 flex size-12 shrink-0 items-center">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-slate-900 text-lg font-bold flex-1 text-center">NFTs Của Tôi</h2>
                <div className="w-12"></div>
            </div>

            <div className="mt-2 flex-1 rounded-t-[40px] border-t border-slate-100 bg-white pt-6">
                <div className="px-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#330df2]"></div>
                        </div>
                    ) : nfts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Grid3x3 className="w-16 h-16 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có NFT nào</h3>
                            <p className="text-slate-500 mb-6">Khám phá thị trường để sưu tập NFT</p>
                            <button
                                onClick={() => router.push('/explore')}
                                className="px-6 py-3 bg-[#330df2] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#330df2]/20"
                            >
                                Khám Phá Thị Trường
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 pb-6">
                            {nfts.map((nft) => (
                                <div
                                    key={nft.productId}
                                    className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                                        <img
                                            src={nft.imageUrl}
                                            alt={nft.title}
                                            className="h-full w-full object-cover"
                                        />
                                        {/* Quantity Badge */}
                                        {nft.quantity > 1 && (
                                            <div className="absolute top-2 right-2 rounded-full bg-black/70 backdrop-blur-sm px-2 py-1 text-xs font-bold text-white">
                                                x{nft.quantity}
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-3">
                                        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-slate-900">
                                            {nft.title}
                                        </h3>
                                        <div className="flex items-center gap-1.5">
                                            {nft.creatorAvatarUrl ? (
                                                <div className="relative h-4 w-4 overflow-hidden rounded-full">
                                                    <img
                                                        src={nft.creatorAvatarUrl}
                                                        alt={nft.creatorHandle}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-4 w-4 rounded-full bg-blue-500/20" />
                                            )}
                                            <p className="text-xs text-slate-500 truncate">
                                                {nft.creatorHandle || 'Không rõ tác giả'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
