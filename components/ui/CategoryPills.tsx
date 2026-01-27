'use client';

type Category = { id: string; label: string };

type Props = {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
};

export function CategoryPills({
  categories,
  activeId,
  onSelect,
  className = '',
}: Props) {
  return (
    <div
      className={`flex gap-3 overflow-x-auto pb-2 custom-scrollbar ${className}`}
      role="tablist"
      aria-label="Categories"
    >
      {categories.map((cat) => {
        const isActive = activeId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(cat.id)}
            className={`flex h-10 shrink-0 items-center justify-center rounded-full px-6 text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
                : 'border border-[var(--color-border)] bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
