'use client';

import { ReferralSection } from '@/components/referral/ReferralSection';

export default function ProfilePage() {
  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold">Hồ sơ người dùng</h1>
      <p className="mt-2 text-gray-600">
        Phần giới thiệu đã được chuyển về trang chủ.
      </p>
      <div className="mt-6">
        <p className="text-sm italic text-slate-400">Section moved to Home.</p>
      </div>
    </div>
  );
}
