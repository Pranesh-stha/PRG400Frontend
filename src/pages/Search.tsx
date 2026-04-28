import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';

import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { listProperties } from '@/lib/api';
import type { PropertyFilters } from '@/lib/types';
import { cn } from '@/lib/utils';

const TYPES = ['hotel', 'villa', 'apartment', 'room', 'cabin', 'cottage'];
const COMMON_AMENITIES = [
  'wifi',
  'pool',
  'parking',
  'kitchen',
  'air-conditioning',
  'washer',
  'pets-allowed',
];

function parseFilters(sp: URLSearchParams): PropertyFilters {
  const f: PropertyFilters = {};
  const city = sp.get('city');
  if (city) f.city = city;
  const country = sp.get('country');
  if (country) f.country = country;
  const location = sp.get('location');
  if (location) f.location = location;
  const property_type = sp.get('property_type');
  if (property_type) f.property_type = property_type;
  const min_price = sp.get('min_price');
  if (min_price) f.min_price = Number(min_price);
  const max_price = sp.get('max_price');
  if (max_price) f.max_price = Number(max_price);
  const guests = sp.get('guests');
  if (guests) f.guests = Number(guests);
  const check_in = sp.get('check_in');
  if (check_in) f.check_in = check_in;
  const check_out = sp.get('check_out');
  if (check_out) f.check_out = check_out;
  const amenities = sp.getAll('amenities');
  if (amenities.length) f.amenities = amenities;
  return f;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => listProperties({ ...filters, limit: 24 }),
  });

  const updateFilter = (key: string, value: string | string[] | null) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    if (Array.isArray(value)) {
      value.forEach((v) => next.append(key, v));
    } else if (value !== null && value !== '') {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams(new URLSearchParams());

  const activeFilterCount = Array.from(searchParams.keys()).length;

  return (
    <>
      {/* Sticky search bar */}
      <div className="border-b border-ink-line bg-white">
        <div className="container-page py-4">
          <SearchBar variant="compact" initial={filters as never} />
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block">
            <FilterPanel
              filters={filters}
              onChange={updateFilter}
              onClear={clearAll}
            />
          </aside>

          {/* Mobile filter trigger */}
          <div className="flex items-center justify-between lg:hidden">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-line bg-white px-4 py-2 text-sm font-medium"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="text-sm font-medium text-ink-muted hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h1 className="text-xl font-semibold text-ink sm:text-2xl">
                  {filters.location
                    ? `Stays in ${filters.location}`
                    : filters.city
                      ? `Stays in ${filters.city}`
                      : filters.country
                        ? `Stays in ${filters.country}`
                        : 'All stays'}
                </h1>
                <p className="mt-1 text-sm text-ink-muted">
                  {isLoading
                    ? 'Searching…'
                    : `${data?.total ?? 0} properties available`}
                </p>
              </div>
            </div>

            {isLoading ? (
              <CardGridSkeleton />
            ) : data && data.items.length > 0 ? (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            ) : (
              <EmptyResults onClear={clearAll} hasFilters={activeFilterCount > 0} />
            )}
          </section>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="rounded-full p-2 hover:bg-ink/[0.04]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel
              filters={filters}
              onChange={updateFilter}
              onClear={clearAll}
            />
            <div className="mt-6">
              <Button
                className="w-full"
                onClick={() => setShowMobileFilters(false)}
              >
                Show results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface FilterProps {
  filters: PropertyFilters;
  onChange: (key: string, value: string | string[] | null) => void;
  onClear: () => void;
}

function FilterPanel({ filters, onChange, onClear }: FilterProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-ink-line bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Filters</h3>
        <button
          onClick={onClear}
          className="text-xs font-medium text-ink-muted hover:text-ink"
        >
          Clear all
        </button>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-muted">
          Price per night (USD)
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={filters.min_price ?? ''}
            onChange={(e) => onChange('min_price', e.target.value || null)}
            className="h-10"
          />
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={filters.max_price ?? ''}
            onChange={(e) => onChange('max_price', e.target.value || null)}
            className="h-10"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-muted">
          Property type
        </label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const active = filters.property_type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onChange('property_type', active ? null : t)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  active
                    ? 'border-primary bg-primary text-white'
                    : 'border-ink-line text-ink-muted hover:border-ink hover:text-ink'
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-muted">
          Amenities
        </label>
        <div className="space-y-1.5">
          {COMMON_AMENITIES.map((a) => {
            const checked = filters.amenities?.includes(a) ?? false;
            return (
              <label
                key={a}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-ink-muted hover:bg-ink/[0.03]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const current = filters.amenities ?? [];
                    const next = e.target.checked
                      ? [...current, a]
                      : current.filter((x) => x !== a);
                    onChange('amenities', next.length ? next : null);
                  }}
                  className="h-4 w-4 rounded border-ink-line text-primary focus:ring-primary/30"
                />
                <span className="capitalize">{a.replace('-', ' ')}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CardGridSkeleton() {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-ink/5" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-ink/5" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-ink/5" />
        </div>
      ))}
    </div>
  );
}

function EmptyResults({
  onClear,
  hasFilters,
}: {
  onClear: () => void;
  hasFilters: boolean;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-line bg-white p-10 text-center">
      <p className="text-sm font-medium text-ink">No matches</p>
      <p className="mt-1 text-sm text-ink-muted">
        Try widening your dates or removing some filters.
      </p>
      {hasFilters && (
        <Button variant="outline" className="mt-4" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
