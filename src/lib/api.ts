import axios from 'axios';

import type {
  AuthResponse,
  Booking,
  PropertyDetail,
  PropertyFilters,
  PropertyList,
  Review,
  User,
} from './types';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000, // generous for Render cold starts
});

const TOKEN_KEY = 'stay.token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      setStoredToken(null);
    }
    return Promise.reject(error);
  }
);

// ---------- Auth ----------
export async function register(payload: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

// ---------- Properties ----------
export async function listProperties(
  filters: PropertyFilters = {}
): Promise<PropertyList> {
  const params: Record<string, string | number | string[]> = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)) {
      params[k] = v as string | number | string[];
    }
  }
  const { data } = await api.get<PropertyList>('/properties', { params });
  return data;
}

export async function getProperty(id: string): Promise<PropertyDetail> {
  const { data } = await api.get<PropertyDetail>(`/properties/${id}`);
  return data;
}

// ---------- Reviews ----------
export async function listPropertyReviews(propertyId: string): Promise<Review[]> {
  const { data } = await api.get<Review[]>(`/reviews/property/${propertyId}`);
  return data;
}

// ---------- Bookings (used in Phase 7+) ----------
export async function createBooking(payload: {
  property_id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
}): Promise<Booking> {
  const { data } = await api.post<Booking>('/bookings', payload);
  return data;
}

export async function myBookings(): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>('/bookings/me');
  return data;
}
