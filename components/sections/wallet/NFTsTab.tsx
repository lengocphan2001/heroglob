'use client';

import { useEffect, useState } from 'react';
import { getMyProducts, type UserProduct } from '@/lib/api/products';
import { Package } from 'lucide-react';

export function NFTsTab() {
    const [products, setProducts] = useState<UserProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getMyProducts()
            .then(setProducts)
            .catch((err) => {
                console.error('Failed to fetch products:', err);
                setError('Không thể tải sản phẩm');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="px-6 pt-4">
                <p className="py-8 text-center text-sm text-slate-500">Đang tải...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-6 pt-4">
                <p className="py-8 text-center text-sm text-slate-500">{error}</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="px-6 pt-4">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100">
                        <Package className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-center text-sm text-slate-500">Chưa có sản phẩm nào.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 pt-4 pb-4">
            <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                    <div
                        key={product.productId}
                        className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                    >
                        {/* Product Image */}
                        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                            <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="h-full w-full object-cover"
                            />
                            {/* Quantity Badge */}
                            {product.quantity > 1 && (
                                <div className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white">
                                    x{product.quantity}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="p-3">
                            <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-slate-900">
                                {product.title}
                            </h3>
                            <div className="flex items-center gap-1.5">
                                {product.creatorAvatarUrl && (
                                    <img
                                        src={product.creatorAvatarUrl}
                                        alt={product.creatorHandle}
                                        className="h-4 w-4 rounded-full object-cover"
                                    />
                                )}
                                <p className="text-xs text-slate-500">{product.creatorHandle}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
