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
}

export interface DbSalon {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  coverImage?: string;
  logo?: string;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function fetchNearbyDbSalons(lat: number, lng: number, radiusKm: number = 10): Promise<DbSalon[]> {
  try {
    const { data } = await api.get('/salons');
    const salons: DbSalon[] = data.data || [];
    return salons
      .filter((s) => s.latitude && s.longitude && haversine(lat, lng, s.latitude, s.longitude) <= radiusKm)
      .sort((a, b) => haversine(lat, lng, a.latitude, a.longitude) - haversine(lat, lng, b.latitude, b.longitude));
  } catch {
    return [];
  }
}

export function loadLeaflet(): Promise<typeof import('leaflet')> {
  return import('leaflet');
}

export const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

interface OverpassNode {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    phone?: string;
    website?: string;
    opening_hours?: string;
    rating?: string;
    amenity?: string;
    shop?: string;
  };
}

export async function searchNearbyWithOverpass(lat: number, lng: number, radius: number = 3000): Promise<NearbyPlace[]> {
  const query = `
    [out:json];
    (
      node["amenity"="beauty_salon"](around:${radius},${lat},${lng});
      node["shop"="hairdresser"](around:${radius},${lat},${lng});
      node["amenity"="spa"](around:${radius},${lat},${lng});
      node["shop"="beauty"](around:${radius},${lat},${lng});
      node["amenity"="hair_care"](around:${radius},${lat},${lng});
      node["shop"="barber"](around:${radius},${lat},${lng});
      node["shop"="nail_salon"](around:${radius},${lat},${lng});
      node["shop"="massage"](around:${radius},${lat},${lng});
    );
    out body;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'HairEco/1.0' },
  });

  const data = await res.json();
  const elements: OverpassNode[] = data.elements || [];

  return elements
    .filter((n) => n.tags?.name)
    .map((n) => ({
      id: String(n.id),
      name: n.tags.name || 'Unknown',
      lat: n.lat,
      lng: n.lon,
      address: [n.tags['addr:street'], n.tags['addr:housenumber']].filter(Boolean).join(' ') || '',
      phone: n.tags.phone || '',
      type: n.tags.amenity || n.tags.shop || '',
    }));
}
