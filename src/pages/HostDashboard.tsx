import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Calendar, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import StarRating from '@/components/StarRating';
import { Button } from '@/components/ui/Button';
import { deleteProperty, hostBookings, listMyProperties } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Booking, PropertySummary } from '@/lib/types';
import { cn, formatPrice } from '@/lib/utils';

const FALLBACK =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=70';

type Tab = 'listings' | 'bookings';

export default function HostDashboard() {
  const { isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('listings');

  if (loading) {
    return <CenterSpinner />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
            Host dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage your listings and the bookings on them.
          </p>
        </div>
        <Link to="/host/properties/new">
          <Button>
            <Plus className="h-4 w-4" />
            New listing
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-1 border-b border-ink-line">
        <TabBtn active={tab === 'listings'} onClick={() => setTab('listings')}>
          My listings
        </TabBtn>
        <TabBtn active={tab === 'bookings'} onClick={() => setTab('bookings')}>
          Bookings on my places
        </TabBtn>
      </div>

      {tab === 'listings' ? <Listings /> : <BookingsOnMyPlaces />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-primary text-ink'
          : 'border-transparent text-ink-muted hover:text-ink'
      )}
    >
      {children}
    </button>
  );
}

function Listings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-properties'],
    queryFn: listMyProperties,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      toast.success('Listing removed.');
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
    },
    onError: () => toast.error('Could not delete listing.'),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink/5" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-line p-10 text-center">
        <p className="text-base font-medium text-ink">No listings yet</p>
        <p className="mt-1 text-sm text-ink-muted">
          Add your first place to start earning.
        </p>
        <Link to="/host/properties/new">
          <Button className="mt-4">
            <Plus className="h-4 w-4" />
            Create your first listing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((p) => (
        <ListingRow
          key={p.id}
          property={p}
          onEdit={() => navigate(`/host/properties/${p.id}/edit`)}
          onDelete={() => {
            if (confirm(`Remove "${p.title}"? This hides it from search.`))
              deleteMutation.mutate(p.id);
          }}
          deleting={deleteMutation.isPending && deleteMutation.variables === p.id}
        />
      ))}
    </div>
  );
}

function ListingRow({
  property,
  onEdit,
  onDelete,
  deleting,
}: {
  property: PropertySummary;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ink-line bg-white p-4 sm:flex-row sm:items-center">
      <Link
        to={`/property/${property.id}`}
        className="block aspect-[4/3] w-full overflow-hidden rounded-xl bg-ink/5 sm:h-24 sm:w-32 sm:flex-shrink-0"
      >
        <img
          src={property.primary_image_url ?? FALLBACK}
          alt={property.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK;
          }}
        />
      </Link>
      <div className="flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Link
            to={`/property/${property.id}`}
            className="text-base font-semibold text-ink hover:text-primary"
          >
            {property.title}
          </Link>
          <StarRating
            rating={property.average_rating}
            reviewCount={property.review_count}
          />
        </div>
        <p className="mt-0.5 text-xs text-ink-muted">
          {property.city}, {property.country} · {property.property_type}
        </p>
        <p className="mt-2 text-sm text-ink">
          <span className="font-semibold">
            {formatPrice(property.price_per_night)}
          </span>
          <span className="text-ink-muted"> / night</span>
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={deleting}
          className="text-red-600 hover:bg-red-50"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

function BookingsOnMyPlaces() {
  const { data, isLoading } = useQuery({
    queryKey: ['host-bookings'],
    queryFn: hostBookings,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink/5" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-line p-10 text-center">
        <p className="text-base font-medium text-ink">No bookings yet</p>
        <p className="mt-1 text-sm text-ink-muted">
          When guests book your places, they'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((b) => (
        <HostBookingRow key={b.id} booking={b} />
      ))}
    </div>
  );
}

function HostBookingRow({ booking }: { booking: Booking }) {
  const checkIn = parseISO(booking.check_in);
  const checkOut = parseISO(booking.check_out);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <Link
          to={`/property/${booking.property_id}`}
          className="block h-16 w-20 overflow-hidden rounded-lg bg-ink/5"
        >
          <img
            src={booking.property?.primary_image_url ?? FALLBACK}
            alt={booking.property?.title ?? ''}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK;
            }}
          />
        </Link>
        <div>
          <p className="text-sm font-semibold text-ink">
            {booking.property?.title}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-muted">
            <Calendar className="h-3 w-3" />
            {format(checkIn, 'MMM d')} → {format(checkOut, 'MMM d, yyyy')}
            <span className="text-ink-subtle">·</span>
            {booking.num_guests} guest{booking.num_guests > 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
            booking.status === 'confirmed'
              ? 'border-primary/20 bg-primary-subtle text-primary'
              : booking.status === 'cancelled'
              ? 'border-ink-line bg-ink/5 text-ink-muted'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          )}
        >
          {booking.status}
        </span>
        <p className="text-sm font-semibold text-ink">
          {formatPrice(booking.total_price)}
        </p>
      </div>
    </div>
  );
}

function CenterSpinner() {
  return (
    <div className="container-page flex h-96 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-ink-subtle" />
    </div>
  );
}
