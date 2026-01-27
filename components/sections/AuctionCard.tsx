import { Coins } from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';

export type AuctionCardProps = {
  imageUrl: string;
  title: string;
  timeLeft: string;
  highestBidLabel?: string;
  highestBidValue: string;
  bidButtonLabel?: string;
  onBid?: () => void;
};

export function AuctionCard({
  imageUrl,
  title,
  timeLeft,
  highestBidLabel = 'Highest Bid',
  highestBidValue,
  bidButtonLabel = 'PLACE BID',
  onBid,
}: AuctionCardProps) {
  return (
    <div className="soft-shadow flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4">
      <div
        className="h-20 w-20 flex-shrink-0 rounded-xl bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-start justify-between">
          <h4 className="truncate font-bold text-slate-900">{title}</h4>
          <Badge variant="timer">{timeLeft}</Badge>
        </div>
        <p className="mb-2 text-xs text-slate-400">{highestBidLabel}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 font-bold text-slate-900" aria-hidden />
            <span className="font-bold text-slate-900">{highestBidValue}</span>
          </div>
          <Button size="sm" onClick={onBid} type="button">
            {bidButtonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
