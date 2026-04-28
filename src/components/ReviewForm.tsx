import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from './ui/Button';
import { createReview } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Props {
  bookingId: string;
  onDone?: () => void;
}

export default function ReviewForm({ bookingId, onDone }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createReview({
        booking_id: bookingId,
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Thanks for your review!');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      onDone?.();
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Could not submit review.';
      toast.error(detail);
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Please pick a rating.');
      return;
    }
    mutation.mutate();
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-xl border border-ink-line bg-white p-4">
      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
          Your rating
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (hover || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="p-1"
                aria-label={`${n} stars`}
              >
                <Star
                  className={cn(
                    'h-6 w-6 transition-colors',
                    active ? 'fill-star text-star' : 'text-ink-line'
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
          Comment <span className="text-ink-subtle normal-case">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="What did you love about this place?"
          className="w-full rounded-xl border border-ink-line bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit review
      </Button>
    </form>
  );
}
