import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  createProperty,
  getProperty,
  updateProperty,
} from '@/lib/api';
import type { PropertyImageInput, PropertyInput } from '@/lib/api';
import { useAuth } from '@/lib/auth';
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
  'breakfast',
  'gym',
  'fireplace',
  'workspace',
];

interface FormState {
  title: string;
  description: string;
  property_type: string;
  address: string;
  city: string;
  country: string;
  price_per_night: string;
  max_guests: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  images: PropertyImageInput[];
}

const empty: FormState = {
  title: '',
  description: '',
  property_type: 'apartment',
  address: '',
  city: '',
  country: '',
  price_per_night: '',
  max_guests: '2',
  bedrooms: '1',
  bathrooms: '1',
  amenities: [],
  images: [],
};

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState<FormState>(empty);
  const [imageUrl, setImageUrl] = useState('');

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id!),
    enabled: isEdit && isAuthenticated,
  });

  useEffect(() => {
    if (!existing) return;
    setForm({
      title: existing.title,
      description: existing.description,
      property_type: existing.property_type,
      address: existing.address,
      city: existing.city,
      country: existing.country,
      price_per_night: String(existing.price_per_night),
      max_guests: String(existing.max_guests),
      bedrooms: String(existing.bedrooms),
      bathrooms: String(existing.bathrooms),
      amenities: existing.amenities,
      images: existing.images.map((i) => ({
        url: i.url,
        display_order: i.display_order,
        is_primary: i.is_primary,
      })),
    });
  }, [existing]);

  const buildPayload = (): PropertyInput => ({
    title: form.title.trim(),
    description: form.description.trim(),
    property_type: form.property_type,
    address: form.address.trim(),
    city: form.city.trim(),
    country: form.country.trim(),
    price_per_night: Number(form.price_per_night),
    max_guests: Number(form.max_guests),
    bedrooms: Number(form.bedrooms),
    bathrooms: Number(form.bathrooms),
    amenities: form.amenities,
    images: form.images,
  });

  const createMut = useMutation({
    mutationFn: () => createProperty(buildPayload()),
    onSuccess: (created) => {
      toast.success('Listing published!');
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate(`/property/${created.id}`);
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Could not publish.';
      toast.error(typeof detail === 'string' ? detail : 'Validation failed');
    },
  });

  const updateMut = useMutation({
    mutationFn: () => updateProperty(id!, buildPayload()),
    onSuccess: (updated) => {
      toast.success('Listing updated.');
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate(`/property/${updated.id}`);
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Could not update.';
      toast.error(typeof detail === 'string' ? detail : 'Validation failed');
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.city || !form.country) {
      toast.error('Please fill out the required fields.');
      return;
    }
    if (Number(form.price_per_night) <= 0) {
      toast.error('Price must be greater than 0.');
      return;
    }
    isEdit ? updateMut.mutate() : createMut.mutate();
  };

  const addImage = () => {
    const url = imageUrl.trim();
    if (!url) return;
    setForm((f) => ({
      ...f,
      images: [
        ...f.images,
        {
          url,
          display_order: f.images.length,
          is_primary: f.images.length === 0,
        },
      ],
    }));
    setImageUrl('');
  };

  const removeImage = (idx: number) => {
    setForm((f) => {
      const next = f.images.filter((_, i) => i !== idx);
      // ensure at least one is_primary remains
      if (next.length && !next.some((i) => i.is_primary)) {
        next[0] = { ...next[0], is_primary: true };
      }
      return { ...f, images: next };
    });
  };

  const setPrimary = (idx: number) => {
    setForm((f) => ({
      ...f,
      images: f.images.map((img, i) => ({ ...img, is_primary: i === idx })),
    }));
  };

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  };

  if (loading || (isEdit && loadingExisting)) {
    return (
      <div className="container-page flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-subtle" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const submitting = createMut.isPending || updateMut.isPending;

  return (
    <div className="container-page max-w-3xl py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="mb-2 text-2xl font-semibold text-ink sm:text-3xl">
        {isEdit ? 'Edit listing' : 'List a new place'}
      </h1>
      <p className="mb-8 text-sm text-ink-muted">
        Tell guests what makes your place special.
      </p>

      <form onSubmit={submit} className="space-y-8">
        <Section title="The basics">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="Cozy loft in city center"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={5}
              className="w-full rounded-xl border border-ink-line bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="What makes this place special? Beds, neighborhood, vibe."
            />
          </Field>
          <Field label="Property type">
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, property_type: t })}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                    form.property_type === t
                      ? 'border-primary bg-primary text-white'
                      : 'border-ink-line text-ink-muted hover:border-ink hover:text-ink'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        <Section title="Location">
          <Field label="Address">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
              placeholder="Street, building, etc."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City">
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </Field>
            <Field label="Country">
              <Input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
              />
            </Field>
          </div>
        </Section>

        <Section title="Capacity & price">
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Max guests">
              <Input
                type="number"
                min={1}
                value={form.max_guests}
                onChange={(e) => setForm({ ...form, max_guests: e.target.value })}
              />
            </Field>
            <Field label="Bedrooms">
              <Input
                type="number"
                min={0}
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
              />
            </Field>
            <Field label="Bathrooms">
              <Input
                type="number"
                min={0}
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
              />
            </Field>
            <Field label="Price / night (USD)">
              <Input
                type="number"
                min={1}
                step="0.01"
                value={form.price_per_night}
                onChange={(e) =>
                  setForm({ ...form, price_per_night: e.target.value })
                }
                required
              />
            </Field>
          </div>
        </Section>

        <Section title="Amenities">
          <div className="flex flex-wrap gap-2">
            {COMMON_AMENITIES.map((a) => {
              const on = form.amenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                    on
                      ? 'border-primary bg-primary text-white'
                      : 'border-ink-line text-ink-muted hover:border-ink hover:text-ink'
                  )}
                >
                  {a.replace('-', ' ')}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Photos">
          <p className="text-xs text-ink-muted">
            Paste image URLs (e.g. from Unsplash). The first one becomes the cover.
          </p>
          <div className="flex gap-2">
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
            <Button type="button" variant="outline" onClick={addImage}>
              <ImagePlus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {form.images.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {form.images.map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    'group relative aspect-[4/3] overflow-hidden rounded-xl border bg-ink/5',
                    img.is_primary ? 'border-primary' : 'border-ink-line'
                  )}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setPrimary(i)}
                      className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-ink hover:bg-primary hover:text-white"
                    >
                      {img.is_primary ? 'Cover' : 'Make cover'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="rounded-full bg-white p-1 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <div className="flex justify-end gap-3 border-t border-ink-line pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} size="lg">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Publish listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-ink-line bg-white p-6">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
