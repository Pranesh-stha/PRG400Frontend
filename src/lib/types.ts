export type PropertyType =
  | 'hotel'
  | 'villa'
  | 'apartment'
  | 'room'
  | 'cabin'
  | 'cottage';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_host: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PropertyImage {
  id: string;
  url: string;
  display_order: number;
  is_primary: boolean;
}

export interface PropertySummary {
  id: string;
  title: string;
  city: string;
  country: string;
  property_type: string;
  price_per_night: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  primary_image_url: string | null;
  average_rating: number | null;
  review_count: number;
}

export interface PropertyList {
  items: PropertySummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface HostSummary {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export interface PropertyDetail {
  id: string;
  host_id: string;
  title: string;
  description: string;
  property_type: string;
  address: string;
  city: string;
  country: string;
  latitude: string | null;
  longitude: string | null;
  price_per_night: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images: PropertyImage[];
  host: HostSummary;
  average_rating: number | null;
  review_count: number;
}

export interface PropertyFilters {
  city?: string;
  country?: string;
  location?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  guests?: number;
  check_in?: string;
  check_out?: string;
  amenities?: string[];
  limit?: number;
  offset?: number;
}

export interface ReviewerSummary {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  guest: ReviewerSummary;
}

export interface BookingPropertyMini {
  id: string;
  title: string;
  city: string;
  country: string;
  primary_image_url: string | null;
}

export interface Booking {
  id: string;
  property_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_price: string;
  status: BookingStatus;
  created_at: string;
  property: BookingPropertyMini | null;
}
