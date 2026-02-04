import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { useConfig } from '@/contexts/ConfigContext';

type Props = {
  title?: string;
  connectLabel?: string;
  onConnect?: () => void;
};

export function SiteHeader({
  title,
  connectLabel = 'Connect',
  onConnect,
}: Props) {
  const config = useConfig();
  const displayTitle = title ?? config.projectName;

  return (
    <header className="sticky top-0 z-50 glass-light flex items-center justify-between gap-3 px-4 py-3">
      <Link href="/" className="flex items-center gap-2">
        <div className="accent-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm overflow-hidden">
          {config.projectLogo ? (
            <img src={config.projectLogo} alt={config.projectName} className="w-full h-full object-cover" />
          ) : (
            <Sparkles className="h-5 w-5" aria-hidden />
          )}
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">{displayTitle}</h1>
      </Link>
      {onConnect ? (
        <Button type="button" onClick={onConnect} size="md">
          {connectLabel}
        </Button>
      ) : (
        <ConnectButton />
      )}
    </header>
  );
}
