import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Calendar,
  MapPin,
  Share2,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import StarRating from '@/components/StarRating';
import { Button } from '@/components/ui/Button';
import { getProperty, listPropertyReviews } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  cn,
  formatPrice,
  fromIsoDate,
  nightsBetween,
  toIsoDate,
} from '@/lib/utils';

const FALLBACK =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=70';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id!),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => listPropertyReviews(id!),
    enabled: !!id,
  });

  if (isLoading || !property) {
    return (
      <div className="container-page py-10">
        <div className="grid h-96 animate-pulse rounded-2xl bg-ink/5" />
        <div className="mt-6 h-6 w-1/3 animate-pulse rounded bg-ink/5" />
        <div className="mt-2 h-4 w-1/4 animate-pulse rounded bg-ink/5" />
      </div>
    );
  }

  const images = property.images.length
    ? property.images
    : [{ id: 'fb', url: FALLBACK, display_order: 0, is_primary: true }];
  const primary = images.find((i) => i.is_primary) ?? images[0];
  const others = images.filter((i) => i.id !== primary.id).slice(0, 4);

  return (
    <div className="container-page py-8">
      {/* Back */}
      <div className="mb-4">
        <Link
          to="/search"
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Link>
      </div>

      {/* Title row */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
            {property.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
            <StarRating
              rating={property.average_rating}
              reviewCount={property.review_count}
              size="md"
            />
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {property.city}, {property.country}
            </span>
            <span>·</span>
            <span className="capitalize">{property.property_type}</span>
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
          }}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      {/* Image gallery */}
      <div className="mb-10 grid gap-2 overflow-hidden rounded-2xl sm:grid-cols-4 sm:grid-rows-2">
        <div className="aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto">
          <img
            src={primary.url}
            alt={property.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK;
            }}
          />
        </div>
        {others.map((img, i) => (
          <div key={img.id} className={cn('hidden sm:block', i >= 4 && 'sm:hidden')}>
            <img
              src={img.url}
              alt={`${property.title} ${i + 2}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK;
              }}
            />
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-12 lg:grid-cols-[1fr,380px]">
        <div>
          {/* Host + facts */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-line pb-6">
            <div>
              <p className="text-lg font-semibold text-ink">
                Hosted by {property.host.full_name}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {property.max_guests} guest
                {property.max_guests > 1 ? 's' : ''} · {property.bedrooms} bedroom
                {property.bedrooms !== 1 ? 's' : ''} · {property.bathrooms} bath
                {property.bathrooms !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-base font-semibold text-primary">
              {property.host.full_name
                .split(' ')
                .map((s) => s[0])
                .slice(0, 2)
                .join('')}
            </div>
          </div>

          <div className="space-y-3 border-b border-ink-line py-6 text-sm leading-relaxed text-ink">
            <h2 className="text-lg font-semibold">About this place</h2>
            <p className="whitespace-pre-line text-ink-muted">
              {property.description}
            </p>
          </div>

          {/* Quick facts */}
          <div className="grid grid-cols-3 gap-4 border-b border-ink-line py-6">
            <Fact icon={<Users className="h-4 w-4" />} label="Guests" value={property.max_guests} />
            <Fact icon={<BedDouble className="h-4 w-4" />} label="Bedrooms" value={property.bedrooms} />
            <Fact icon={<Bath className="h-4 w-4" />} label="Baths" value={property.bathrooms} />
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div className="border-b border-ink-line py-6">
              <h2 className="mb-4 text-lg font-semibold">What this place offers</h2>
              <div className="grid grid-cols-2 gap-3 text-sm text-ink">
                {property.amenities.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 rounded-lg bg-ink/[0.03] px-3 py-2 capitalize"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {a.replace('-', ' ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location placeholder */}
          <div className="border-b border-ink-line py-6">
            <h2 className="mb-2 text-lg font-semibold">Where you'll be</h2>
            <p className="text-sm text-ink-muted">{property.address}</p>
            <div className="mt-4 flex h-64 items-center justify-center rounded-2xl bg-primary-subtle text-sm text-ink-muted">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Map preview coming soon
            </div>
          </div>

          {/* Reviews */}
          <div className="py-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <StarRating
                rating={property.average_rating}
                reviewCount={property.review_count}
                size="md"
              />
              <span className="text-base font-normal text-ink-muted">reviews</span>
            </h2>
            {reviews && reviews.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {reviews.slice(0, 6).map((r) => (
                  <div key={r.id}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-subtle text-xs font-semibold text-primary">
                        {r.guest.full_name
                          .split(' ')
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {r.guest.full_name}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {format(new Date(r.created_at), 'MMM yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <StarRating rating={r.rating} reviewCount={1} showCount={false} />
                    </div>
                    {r.comment && (
                      <p className="mt-2 text-sm leading-relaxed text-ink">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">
                No reviews yet — be the first after your stay.
              </p>
            )}
          </div>
        </div>

        {/* Sticky booking widget */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget
            pricePerNight={Number(property.price_per_night)}
            maxGuests={property.max_guests}
            propertyId={property.id}
          />
        </div>
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-ink-line p-4">
      <div className="text-ink-muted">{icon}</div>
      <p className="mt-2 text-xs uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-0.5 text-base font-semibold text-ink">{value}</p>
    </div>
  );
}

interface BookingProps {
  pricePerNight: number;
  maxGuests: number;
  propertyId: string;
}

function BookingWidget({ pricePerNight, maxGuests }: BookingProps) {
  const { isAuthenticated } = useAuth();
  const today = useMemo(() => toIsoDate(new Date()), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toIsoDate(d);
  }, []);

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(1);

  const ci = fromIsoDate(checkIn);
  const co = fromIsoDate(checkOut);
  const nights = ci && co ? nightsBetween(ci, co) : 0;
  const subtotal = nights * pricePerNight;
  const fees = subtotal * 0.08;
  const total = subtotal + fees;

  const handleBook = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to complete your booking. (Auth flow lands next phase.)');
      return;
    }
    if (nights <= 0) {
      toast.error('Choose valid dates first.');
      return;
    }
    toast.info('Booking submission coming next phase.');
  };

  return (
    <div className="rounded-2xl border border-ink-line bg-white p-6 shadow-card">
      <div className="mb-4 flex items-baseline justify-between">
        <p>
          <span className="text-2xl font-semibold text-ink">
            {formatPrice(pricePerNight)}
          </span>
          <span className="ml-1 text-sm text-ink-muted">/ night</span>
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-line">
        <div className="grid grid-cols-2">
          <DateField
            label="Check-in"
            value={checkIn}
            min={today}
            onChange={setCheckIn}
          />
          <div className="border-l border-ink-line">
            <DateField
              label="Check-out"
              value={checkOut}
              min={checkIn}
              onChange={setCheckOut}
            />
          </div>
        </div>
        <div className="border-t border-ink-line">
          <label className="block px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              Guests
            </span>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-ink-muted" />
              <input
                type="number"
                min={1}
                max={maxGuests}
                value={guests}
                onChange={(e) =>
                  setGuests(Math.min(maxGuests, Math.max(1, Number(e.target.value) || 1)))
                }
                className="w-full bg-transparent text-sm focus:outline-none"
              />
              <span className="text-xs text-ink-muted">max {maxGuests}</span>
            </div>
          </label>
        </div>
      </div>

      <Button size="lg" className="mt-4 w-full" onClick={handleBook}>
        {isAuthenticated ? 'Reserve' : 'Sign in to book'}
      </Button>

      {nights > 0 && (
        <div className="mt-5 space-y-2 text-sm text-ink-muted">
          <Row
            label={`${formatPrice(pricePerNight)} × ${nights} night${nights > 1 ? 's' : ''}`}
            value={formatPrice(subtotal)}
          />
          <Row label="Service fee (8%)" value={formatPrice(fees)} />
          <div className="mt-2 flex items-center justify-between border-t border-ink-line pt-3 text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function DateField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block px-3 py-2">
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-ink-muted" />
        <input
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
