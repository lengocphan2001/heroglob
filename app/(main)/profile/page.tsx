'use client';

import { ReferralSection } from '@/components/referral/ReferralSection';

export default function ProfilePage() {
  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900">Profile</h1>
      <p className="mt-2 text-sm text-slate-500">Hồ sơ người dùng.</p>
      <div className="mt-6">
        <ReferralSection />
      </div>
    </div>
  );
}
