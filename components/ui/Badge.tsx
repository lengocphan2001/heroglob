type Variant = 'default' | 'live' | 'timer';

const variants: Record<Variant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  live: 'bg-white/20 backdrop-blur-md text-white border-white/30',
  timer: 'text-[var(--color-primary)] bg-[var(--color-primary-light)] border-blue-200',
};

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

export function Badge({ children, variant = 'default', className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
