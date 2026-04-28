import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

import StarRating from './StarRating';
import type { PropertySummary } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface Props {
  property: PropertySummary;
}

const FALLBACK =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=70';

export default function PropertyCard({ property }: Props) {
  return (
    <Link
      to={`/property/${property.id}`}
      className="group block overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-cardHover"
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink/5">
        <img
          src={property.primary_image_url ?? FALLBACK}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK;
          }}
        />
      </div>

      <div className="px-1 pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-ink">
            {property.title}
          </h3>
          <StarRating
            rating={property.average_rating}
            reviewCount={property.review_count}
            showCount={false}
          />
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">
            {property.city}, {property.country}
          </span>
        </p>
        <p className="mt-2 text-sm text-ink">
          <span className="font-semibold">
            {formatPrice(property.price_per_night)}
          </span>
          <span className="text-ink-muted"> / night</span>
        </p>
      </div>
    </Link>
  );
}
