'use client';

type TabId = 'tokens' | 'nfts' | 'history';

const tabs: { id: TabId; label: string }[] = [
  { id: 'tokens', label: 'Token' },
  { id: 'nfts', label: 'NFTs' },
  { id: 'history', label: 'Lịch sử' },
];

type Props = {
  activeId: TabId;
  onSelect: (id: TabId) => void;
};

export function WalletTabs({ activeId, onSelect }: Props) {
  return (
    <div className="flex gap-8 px-8">
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.id)}
            className={`flex flex-col items-center justify-center border-b-2 pb-3 text-sm font-bold tracking-wide transition-colors ${isActive
              ? 'border-[var(--color-primary)] text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}