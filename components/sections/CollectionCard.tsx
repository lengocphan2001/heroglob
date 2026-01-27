import Link from 'next/link';

export type CollectionCardProps = {
  href?: string;
  imageUrl: string;
  avatarUrl?: string;
  title: string;
  floorLabel?: string;
  floorValue: string;
};

export function CollectionCard({
  href = '#',
  imageUrl,
  avatarUrl,
  title,
  floorLabel = 'Floor Price',
  floorValue,
}: CollectionCardProps) {
  const content = (
    <>
      <div
        className="h-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
        aria-hidden
      />
      <div className="relative p-5">
        {avatarUrl && (
          <div className="absolute -top-7 right-5 h-14 w-14 overflow-hidden rounded-xl border-4 border-white bg-slate-200 shadow-md">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${avatarUrl})` }}
              aria-hidden
            />
          </div>
        )}
        <h4 className="mb-2 truncate pr-14 font-bold text-slate-900">{title}</h4>
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">{floorLabel}</p>
          <p className="accent-text text-sm">{floorValue}</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="soft-shadow group flex-none overflow-hidden rounded-2xl border border-slate-100 bg-white w-64">
      {href ? (
        <Link href={href} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
