import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search as SearchIcon, Users } from 'lucide-react';

import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

interface Props {
  variant?: 'hero' | 'compact';
  initial?: {
    city?: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
  };
}

export default function SearchBar({ variant = 'hero', initial }: Props) {
  const navigate = useNavigate();
  const [city, setCity] = useState(initial?.city ?? '');
  const [checkIn, setCheckIn] = useState(initial?.check_in ?? '');
  const [checkOut, setCheckOut] = useState(initial?.check_out ?? '');
  const [guests, setGuests] = useState<number>(initial?.guests ?? 1);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (checkIn) params.set('check_in', checkIn);
    if (checkOut) params.set('check_out', checkOut);
    if (guests > 1) params.set('guests', String(guests));
    navigate(`/search?${params.toString()}`);
  };

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={submit}
      className={cn(
        'rounded-2xl border border-ink-line bg-white shadow-card',
        isHero ? 'p-2' : 'p-1.5'
      )}
    >
      <div
        className={cn(
          'grid gap-1 sm:grid-cols-[1.5fr,1fr,1fr,0.7fr,auto] sm:items-stretch',
          isHero ? 'sm:gap-2' : ''
        )}
      >
        <Field icon={<MapPin className="h-4 w-4 text-ink-muted" />}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Where are you going?"
            className="h-full w-full bg-transparent text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
          />
        </Field>

        <Field icon={<Calendar className="h-4 w-4 text-ink-muted" />}>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="h-full w-full bg-transparent text-sm text-ink focus:outline-none"
            aria-label="Check-in"
          />
        </Field>

        <Field icon={<Calendar className="h-4 w-4 text-ink-muted" />}>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="h-full w-full bg-transparent text-sm text-ink focus:outline-none"
            aria-label="Check-out"
          />
        </Field>

        <Field icon={<Users className="h-4 w-4 text-ink-muted" />}>
          <input
            type="number"
            min={1}
            max={20}
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
            className="h-full w-full bg-transparent text-sm text-ink focus:outline-none"
            aria-label="Guests"
          />
        </Field>

        <Button type="submit" size={isHero ? 'lg' : 'md'} className="rounded-xl">
          <SearchIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>
    </form>
  );
}

function Field({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-12 items-center gap-2 rounded-xl px-3 transition-colors hover:bg-ink/[0.03]">
      {icon}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
