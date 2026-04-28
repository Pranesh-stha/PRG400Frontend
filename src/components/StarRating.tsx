import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Props {
  rating: number | null;
  reviewCount?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  reviewCount = 0,
  size = 'sm',
  showCount = true,
  className,
}: Props) {
  if (rating === null || reviewCount === 0) {
    return (
      <div className={cn('inline-flex items-center gap-1 text-ink-subtle', className)}>
        <Star className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>New</span>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <Star
        className={cn(
          'fill-star text-star',
          size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
        )}
      />
      <span
        className={cn(
          'font-medium text-ink',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
      >
        {rating.toFixed(1)}
      </span>
      {showCount && (
        <span
          className={cn(
            'text-ink-muted',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}
        >
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
