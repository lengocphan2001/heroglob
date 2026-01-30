'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, UserPlus, ArrowRight, Wallet } from 'lucide-react';
import { register } from '@/lib/auth';
import { getStoredRefCode } from '@/lib/api/referrals';
import Cookies from 'js-cookie';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        refCode: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Auto-fill referral code if available
        const storedRef = getStoredRefCode();
        if (storedRef) {
            setFormData(prev => ({ ...prev, refCode: storedRef }));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu nhập lại không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            const res = await register({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                refCode: formData.refCode || undefined,
            });

            // Login success
            Cookies.set('token', res.access_token, { expires: 7 });
            router.push('/');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-full flex-col bg-white p-6">
            <div className="flex flex-1 flex-col justify-center">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-slate-900">Tạo tài khoản</h1>
                    <p className="text-slate-500">Tham gia Aetheria Metaverse ngay hôm nay</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Họ và tên</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                            <input
                                type="text"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Nhập họ tên của bạn"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                            <input
                                type="email"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                            <input
                                type="password"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Nhập lại mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                            <input
                                type="password"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Mã giới thiệu (Tùy chọn)</label>
                        <div className="relative">
                            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                            <input
                                type="text"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Nhập mã giới thiệu"
                                value={formData.refCode}
                                onChange={e => setFormData({ ...formData, refCode: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-70"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
                        {!loading && <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                        Đăng nhập
                    </Link>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2">
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <span className="text-xs text-slate-400 uppercase">Hoặc</span>
                    <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="mt-6">
                    <Link href="/" className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 font-bold text-slate-700 transition-all hover:bg-slate-50">
                        <Wallet className="size-5 text-slate-500" />
                        Kết nối Ví
                    </Link>
                </div>
            </div>
        </div>
    );
}
