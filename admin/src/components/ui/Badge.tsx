type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const variants: Record<Variant, string> = {
  default: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
};

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

export function Badge({ children, variant = 'default', className = '' }: Props) {
  return (
    <span
      className={
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
        variants[variant] +
        ' ' +
        className
      }
    >
      {children}
    </span>
  );
}
