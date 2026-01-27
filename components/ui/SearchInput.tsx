'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useId } from 'react';

type Props = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFilterClick?: () => void;
  className?: string;
};

export function SearchInput({
  placeholder = 'Search Metaverse & NFTs',
  value = '',
  onChange,
  onFilterClick,
  className = '',
}: Props) {
  const id = useId();
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-4 h-5 w-5 text-slate-400" aria-hidden />
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-800 placeholder:text-slate-500 outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
        aria-label={placeholder}
      />
      {onFilterClick ? (
        <button
          type="button"
          onClick={onFilterClick}
          className="absolute right-4 rounded-lg text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-light)]"
          aria-label="Filter"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      ) : (
        <SlidersHorizontal className="absolute right-4 h-5 w-5 text-slate-400 pointer-events-none" aria-hidden />
      )}
    </div>
  );
}
