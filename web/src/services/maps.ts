export function loadMap() {
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

export interface NearbyPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  type: string;
}

export async function searchNearbyPlaces(lat: number, lng: number, radius: number = 3000): Promise<NearbyPlace[]> {
  const query = `
    [out:json];
    (
      node["amenity"="beauty_salon"](around:${radius},${lat},${lng});
      node["shop"="hairdresser"](around:${radius},${lat},${lng});
      node["amenity"="spa"](around:${radius},${lat},${lng});
      node["shop"="beauty"](around:${radius},${lat},${lng});
      node["amenity"="hair_care"](around:${radius},${lat},${lng});
    );
    out body;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
