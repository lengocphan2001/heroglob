import Link from 'next/link';

type Props = {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  icon?: React.ReactNode;
};

export function SectionTitle({
  title,
  viewAllHref,
  viewAllLabel = 'View All',
  icon,
}: Props) {
  return (
    <div className="mb-5 flex items-center justify-between px-4">
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
        {title}
        {icon}
      </h3>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] hover:underline"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
