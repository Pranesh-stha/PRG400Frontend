import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Castle, Home as HomeIcon, Mountain, Tent, Hotel } from 'lucide-react';

import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';
import { listProperties } from '@/lib/api';

const TYPES = [
  { key: 'hotel', label: 'Hotels', Icon: Hotel },
  { key: 'villa', label: 'Villas', Icon: Castle },
  { key: 'apartment', label: 'Apartments', Icon: Building2 },
  { key: 'cabin', label: 'Cabins', Icon: Mountain },
  { key: 'room', label: 'Rooms', Icon: HomeIcon },
  { key: 'cottage', label: 'Cottages', Icon: Tent },
];

const POPULAR_DESTINATIONS = [
  {
    city: 'Bali',
    country: 'Indonesia',
    image:
      'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=800&q=70',
  },
  {
    city: 'Kyoto',
    country: 'Japan',
    image:
      'https://images.unsplash.com/photo-1545569310-87b9b6f0e3a4?auto=format&fit=crop&w=800&q=70',
  },
  {
    city: 'Santorini',
    country: 'Greece',
    image:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=70',
  },
  {
    city: 'Reykjavik',
    country: 'Iceland',
    image:
      'https://images.unsplash.com/photo-1504233529578-6d46baba6d34?auto=format&fit=crop&w=800&q=70',
  },
];

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => listProperties({ limit: 8 }),
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-subtle">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1800&q=70')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 70%, rgba(255,255,255,1) 100%)',
          }}
        />
        <div className="container-page relative pt-20 pb-32 sm:pt-28 sm:pb-40">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-ink-line bg-white/80 px-3 py-1 text-xs font-medium text-ink-muted backdrop-blur">
              Trusted by curious travelers
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl md:text-6xl">
              Find a place that <span className="text-primary">feels like home</span>,
              wherever you go.
            </h1>
            <p className="mt-4 max-w-xl text-base text-ink-muted sm:text-lg">
              Hotels, villas, cabins and more — discovered by travelers, hosted by
              locals.
            </p>
          </div>
          <div className="mt-10">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Property type pills */}
      <section className="container-page -mt-8 mb-12 relative">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {TYPES.map(({ key, label, Icon }) => (
            <Link
              key={key}
              to={`/search?property_type=${key}`}
              className="flex shrink-0 items-center gap-2 rounded-full border border-ink-line bg-white px-4 py-2 text-sm font-medium text-ink-muted shadow-card transition-colors hover:border-primary hover:text-primary"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-page mb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">
              Recently added stays
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Fresh places, just listed by hosts.
            </p>
          </div>
          <Link
            to="/search"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            See all →
          </Link>
        </div>

        {isLoading ? (
          <CardGridSkeleton />
        ) : data && data.items.length > 0 ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <EmptyHint />
        )}
      </section>

      {/* Popular destinations */}
      <section className="container-page mb-20">
        <h2 className="mb-6 text-xl font-semibold text-ink sm:text-2xl">
          Popular destinations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_DESTINATIONS.map((d) => (
            <Link
              key={d.city}
              to={`/search?city=${encodeURIComponent(d.city)}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
            >
              <img
                src={d.image}
                alt={d.city}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-ink/0" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-lg font-semibold">{d.city}</p>
                <p className="text-xs opacity-90">{d.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function CardGridSkeleton() {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-ink/5" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-ink/5" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-ink/5" />
        </div>
      ))}
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-line bg-white p-10 text-center">
      <p className="text-sm font-medium text-ink">No stays yet</p>
      <p className="mt-1 text-sm text-ink-muted">
        Be the first to list a property — sign in and create one in the host
        dashboard.
      </p>
    </div>
  );
}
