import type { TdHTMLAttributes, ThHTMLAttributes } from 'react';

export function Table({
  className = '',
  children,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table
        className={'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 ' + className}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  className = '',
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={
        'bg-zinc-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400 ' +
        className
      }
      {...props}
    />
  );
}

export function TableBody({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={'divide-y divide-zinc-200 dark:divide-zinc-700 ' + className} {...props} />;
}

export function TableRow({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={
        'bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 ' +
        className
      }
      {...props}
    />
  );
}

export function TableCell({
  className = '',
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={'whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 ' + className}
      {...props}
    />
  );
}
