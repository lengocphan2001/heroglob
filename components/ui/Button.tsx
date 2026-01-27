import { type ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] text-white shadow-sm hover:bg-[var(--color-primary-hover)] active:scale-[0.98] transition-all',
  outline:
    'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition-all',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 active:scale-[0.98] transition-all',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClass = {
  sm: 'text-[10px] font-bold px-4 py-1.5 rounded-lg',
  md: 'text-sm font-bold px-5 py-2 rounded-full',
  lg: 'text-sm font-bold px-6 py-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={`inline-flex items-center justify-center gap-2 font-semibold ${variants[variant]} ${sizeClass[size]} disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
