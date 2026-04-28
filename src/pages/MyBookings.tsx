import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Calendar, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

import ReviewForm from '@/components/ReviewForm';
import { Button } from '@/components/ui/Button';
import { cancelBooking, myBookings } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Booking } from '@/lib/types';
import { cn, formatPrice } from '@/lib/utils';

const FALLBACK =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=70';

export default function MyBookings() {
  const { isAuthenticated, loading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: myBookings,
    enabled: isAuthenticated,
  });

  if (loading) {
    return <CenterSpinner />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-1 text-2xl font-semibold text-ink sm:text-3xl">
        My bookings
      </h1>
      <p className="mb-8 text-sm text-ink-muted">
        Trips you've reserved, past and upcoming.
      </p>

      {isLoading ? (
        <SkeletonList />
      ) : data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </div>
      ) : (
        <EmptyBookings />
      )}
    </div>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const queryClient = useQueryClient();
  const [showReview, setShowReview] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(booking.id),
    onSuccess: () => {
      toast.success('Booking cancelled.');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Could not cancel booking.';
      toast.error(detail);
    },
  });

  const checkOut = parseISO(booking.check_out);
  const checkIn = parseISO(booking.check_in);
  const isPast = checkOut < new Date();
  const canCancel =
    booking.status !== 'cancelled' && !isPast && booking.status !== 'completed';
  const canReview = isPast && booking.status === 'confirmed';

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-line bg-white">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
        <Link
          to={`/property/${booking.property_id}`}
          className="block aspect-[4/3] w-full overflow-hidden rounded-xl bg-ink/5 sm:h-32 sm:w-44 sm:flex-shrink-0"
        >
          <img
            src={booking.property?.primary_image_url ?? FALLBACK}
            alt={booking.property?.title ?? 'Property'}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK;
            }}
          />
        </Link>

        <div className="flex flex-1 flex-col justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Link
                to={`/property/${booking.property_id}`}
                className="text-base font-semibold text-ink hover:text-primary"
              >
                {booking.property?.title ?? 'Booking'}
              </Link>
              <StatusBadge status={booking.status} />
            </div>
            <p className="mt-0.5 text-xs text-ink-muted">
              {booking.property?.city}, {booking.property?.country}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <Calendar className="h-3.5 w-3.5" />
              {format(checkIn, 'MMM d')} → {format(checkOut, 'MMM d, yyyy')}
              <span className="text-ink-subtle">·</span>
              <span>{booking.num_guests} guest{booking.num_guests > 1 ? 's' : ''}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="text-ink-muted">Total</span>{' '}
              <span className="font-semibold text-ink">
                {formatPrice(booking.total_price)}
              </span>
            </p>
            <div className="flex gap-2">
              {canReview && !showReview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReview(true)}
                >
                  <Star className="h-3.5 w-3.5" />
                  Leave a review
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Cancel this booking?')) cancelMutation.mutate();
                  }}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showReview && (
        <div className="border-t border-ink-line bg-ink/[0.02] p-4">
          <ReviewForm bookingId={booking.id} onDone={() => setShowReview(false)} />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Booking['status'] }) {
  const map: Record<Booking['status'], string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-primary-subtle text-primary border-primary/20',
    cancelled: 'bg-ink/5 text-ink-muted border-ink-line',
    completed: 'bg-ink/5 text-ink-muted border-ink-line',
  };
  return (
    <span
      className={cn(
        'rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
        map[status]
      )}
    >
      {status}
    </span>
  );
}

function CenterSpinner() {
  return (
    <div className="container-page flex h-96 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-ink-subtle" />
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-2xl bg-ink/5" />
      ))}
    </div>
  );
}

function EmptyBookings() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-line bg-white p-12 text-center">
      <p className="text-base font-medium text-ink">No bookings yet</p>
      <p className="mt-1 text-sm text-ink-muted">
        Start exploring stays to find your next trip.
      </p>
      <Link to="/search">
        <Button className="mt-4">Browse stays</Button>
      </Link>
    </div>
  );
}
