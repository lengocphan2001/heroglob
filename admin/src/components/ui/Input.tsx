import { forwardRef, type InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ className = '', label, error, leftIcon, id: idProp, ...props }, ref) => {
    const id = idProp ?? props.name ?? undefined;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon ? (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
              {leftIcon}
            </div>
          ) : null}
          <input
            ref={ref}
            id={id}
            className={[
              'block w-full rounded-lg border bg-white py-2 text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500',
              leftIcon ? 'pl-10 pr-3' : 'px-3',
              error
                ? 'border-red-500 focus:ring-red-500 dark:border-red-400'
                : 'border-zinc-300 dark:border-zinc-600',
              className,
            ].join(' ')}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={id ? `${id}-error` : undefined} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
