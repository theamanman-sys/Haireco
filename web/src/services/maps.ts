import api from './api';

export interface NearbyPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  type: string;
  rating?: number;
  website?: string;
  photoUrl?: string;
  photos?: string[];
}

export interface DbSalon {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  totalReviews: number;
  coverImage?: string;
  logo?: string;
  distance?: number;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

let googleMapsLoaded = false;
let googleMapsPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (googleMapsLoaded) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error('Google Maps API key not configured'));
      return;
    }

    if (window.google?.maps) {
      googleMapsLoaded = true;
      resolve();
      return;
    }

    window.initGoogleMaps = () => {
      googleMapsLoaded = true;
      resolve();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function getGoogleMapsApiKey(): string {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
}

export async function fetchNearbyDbSalons(lat: number, lng: number, radiusKm: number = 10, category?: string): Promise<DbSalon[]> {
  try {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radiusKm) });
    if (category) params.set('category', category);
    const { data } = await api.get(`/salons/nearby?${params.toString()}`);
    return data.data || [];
  } catch {
    return [];
  }
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity?: string;
  formatted_phone_number?: string;
  rating?: number;
  website?: string;
  types?: string[];
  photos?: {
    photo_reference: string;
    width: number;
    height: number;
  }[];
}

interface GooglePlacesResponse {
  results: GooglePlaceResult[];
  status: string;
  error_message?: string;
}

const BEAUTY_PLACE_TYPES = [
  'beauty_salon',
  'hair_care',
  'spa',
  'barber',
  'nail_salon',
  'massage',
  'makeup_artist',
];

export async function searchNearbyWithGoogle(lat: number, lng: number, radius: number = 5000): Promise<NearbyPlace[]> {
  try {
    const { data } = await api.get(`/maps/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return data.data || [];
  } catch (err) {
    console.error('Failed to search nearby places via server:', err);
    return [];
  }
}
