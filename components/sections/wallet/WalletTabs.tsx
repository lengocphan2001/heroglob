'use client';

type TabId = 'tokens' | 'nfts' | 'history';

const tabs: { id: TabId; label: string }[] = [
  { id: 'tokens', label: 'Tài sản' },
  { id: 'nfts', label: 'NFT' },
  { id: 'history', label: 'Lịch sử' },
];

type Props = {
  activeId: TabId;
  onSelect: (id: TabId) => void;
};

export function WalletTabs({ activeId, onSelect }: Props) {
  return (
    <div className="flex gap-1 px-4">
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.id)}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold tracking-wide transition-all"
            style={
              isActive
                ? { background: '#330df2', color: '#fff', boxShadow: '0 4px 14px rgba(51,13,242,0.35)' }
                : { color: '#64748b', background: 'transparent' }
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}