import { useEffect, useRef, useState, type ReactNode } from 'react';

type Item = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
};

type Props = {
  trigger: ReactNode;
  items: Item[];
  align?: 'left' | 'right';
  className?: string;
};

export function Dropdown({ trigger, items, align = 'right', className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} className={'relative inline-block ' + className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {trigger}
      </button>
      {open && (
        <div
          className={
            'absolute z-50 mt-2 min-w-[10rem] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 ' +
            (align === 'right' ? 'right-0' : 'left-0')
          }
          role="menu"
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={
                'flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors ' +
                (item.danger
                  ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                  : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700')
              }
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
