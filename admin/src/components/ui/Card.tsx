import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  action?: React.ReactNode;
};

export function Card({ className = '', title, action, children, ...props }: CardProps) {
  return (
    <div
      className={
        'rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800 ' +
        className
      }
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-700">
          {title && (
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      <div className={title || action ? 'p-5' : 'p-5'}>{children}</div>
    </div>
  );
}
