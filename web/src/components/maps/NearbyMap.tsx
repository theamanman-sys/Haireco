import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadLeaflet, darkTileUrl, tileAttribution, searchNearbyWithOverpass, fetchNearbyDbSalons, type NearbyPlace, type DbSalon } from '../../services/maps';
import { useTranslate } from '../../i18n/useTranslate';
import { Star, MapPin, Navigation, RefreshCw, Crosshair } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const PLACE_TYPES: Record<string, string> = {
  beauty_salon: 'Beauty Salon',
  hair_care: 'Hair Salon',
  spa: 'Spa',
  barber: 'Barber',
  hairdresser: 'Hairdresser',
  beauty: 'Beauty Shop',
  nail_salon: 'Nail Studio',
  massage: 'Massage',
  makeup: 'Makeup Studio',
};

function getTypeEmoji(type: string): string {
  switch (type) {
    case 'beauty_salon': return '💇';
    case 'hair_care':
    case 'hairdresser': return '✂️';
    case 'spa': return '🧖';
    case 'barber': return '💈';
    case 'nail_salon': return '💅';
    case 'massage': return '💆';
    case 'makeup':
    case 'beauty': return '💄';
    default: return '📍';
  }
}

const MARKER_GROUPS: { id: string; markers: any[] }[] = [];

export default function NearbyMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const accCircleRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [dbSalons, setDbSalons] = useState<DbSalon[]>([]);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(true);
  const t = useTranslate();

  const clearMarkers = useCallback((map: any) => {
    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
    }
    markersLayerRef.current = null;
  }, []);

  const fetchAndPlace = useCallback(async (map: any, L: any, lat: number, lng: number) => {
    setSearching(true);
    clearMarkers(map);

    try {
      const [overpassResults, dbResults] = await Promise.all([
        searchNearbyWithOverpass(lat, lng, 5000),
        fetchNearbyDbSalons(lat, lng, 50),
      ]);

      setPlaces(overpassResults);
      setDbSalons(dbResults);

      const markerLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markerLayer;

      const bounds = L.latLngBounds([lat, lng]);

      overpassResults.forEach((place) => {
        bounds.extend([place.lat, place.lng]);
        const marker = L.marker([place.lat, place.lng]).addTo(markerLayer);
        const typeLabel = PLACE_TYPES[place.type] || place.type.replace(/_/g, ' ');
        marker.bindPopup(`
          <div style="color:#1a1510;font-size:13px;max-width:200px">
            <strong>${place.name}</strong><br/>
            <span style="color:#666;font-size:11px">${typeLabel}</span><br/>
            ${place.address ? place.address + '<br/>' : ''}
            ${place.phone ? place.phone : ''}
          </div>
        `);
      });

      const dbIcon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:#c9a84c;border:2px solid #800020;border-radius:3px;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      dbResults.forEach((salon) => {
        if (!salon.latitude || !salon.longitude) return;
        bounds.extend([salon.latitude, salon.longitude]);
        const marker = L.marker([salon.latitude, salon.longitude], { icon: dbIcon }).addTo(markerLayer);
        marker.bindPopup(`
          <div style="color:#1a1510;font-size:13px;max-width:220px">
            ${salon.coverImage ? `<img src="${salon.coverImage}" alt="${salon.name}" style="width:100%;height:80px;object-fit:cover;border-radius:4px;margin-bottom:6px" />` : ''}
            <strong>${salon.name}</strong><br/>
            <span style="color:#666;font-size:11px">${salon.address}</span><br/>
            ${salon.averageRating ? `<span style="color:#d4a000">★ ${salon.averageRating.toFixed(1)}</span>` : ''}
            <br/><a href="/salons/${salon.id}" style="color:#800020;font-size:12px;text-decoration:underline">View details →</a>
          </div>
        `);
      });

      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      if (overpassResults.length === 0 && dbResults.length === 0) map.setView([lat, lng], 14);
    } catch {
      // silent
    } finally {
      setSearching(false);
    }
  }, [clearMarkers]);

  const updateUserLocation = useCallback(async (map: any, L: any, lat: number, lng: number, accuracy: number) => {
    setUserPos({ lat, lng, acc: Math.round(accuracy) });

    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    if (accCircleRef.current) map.removeLayer(accCircleRef.current);

    const userIcon = L.divIcon({
      className: '',
      html: `<div style="width:18px;height:18px;background:#800020;border:3px solid #c9a84c;border-radius:50%;box-shadow:0 0 12px rgba(128,0,32,0.6);position:relative"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:6px;height:6px;background:#fff;border-radius:50%"></div></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    userMarkerRef.current = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    userMarkerRef.current.bindPopup(`<div style="color:#1a1510;font-size:13px"><strong>You are here</strong><br/><span style="color:#666;font-size:11px">Accuracy: ±${Math.round(accuracy)}m</span></div>`);

    if (accuracy < 500) {
      accCircleRef.current = L.circle([lat, lng], {
        radius: accuracy,
        color: '#800020',
        fillColor: '#800020',
        fillOpacity: 0.08,
        weight: 1,
        opacity: 0.3,
      }).addTo(map);
    }
  }, []);

  const startWatching = useCallback(async (map: any, L: any) => {
    if (!navigator.geolocation) {
      setError(t('salons.mapGeolocationError'));
      setLoading(false);
      setLocating(false);
      return;
    }

    let firstFix = true;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setLocating(false);
        setLoading(false);

        await updateUserLocation(map, L, lat, lng, accuracy);

        if (firstFix) {
          map.setView([lat, lng], 14);
          firstFix = false;
          await fetchAndPlace(map, L, lat, lng);
        }
      },
      (err) => {
        setLocating(false);
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError(t('salons.mapLocationError'));
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  }, [fetchAndPlace, updateUserLocation, t]);

  const handleRefresh = useCallback(async () => {
    if (!mapInstance.current || !userPos) return;
    const L = await loadLeaflet();
    await fetchAndPlace(mapInstance.current, L, userPos.lat, userPos.lng);
  }, [userPos, fetchAndPlace]);

  const handleRecenter = useCallback(() => {
    if (!mapInstance.current || !userPos) return;
    mapInstance.current.setView([userPos.lat, userPos.lng], 14, { animate: true });
  }, [userPos]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const L = await loadLeaflet();
        if (!mapRef.current || cancelled) return;

        const map = L.map(mapRef.current, {
          center: [9.03, 38.74],
          zoom: 13,
          zoomControl: true,
        });
        mapInstance.current = map;

        L.tileLayer(darkTileUrl, {
          attribution: tileAttribution,
          maxZoom: 19,
        }).addTo(map);

        await startWatching(map, L);
      } catch {
        if (!cancelled) {
          setError(t('salons.mapLoadError'));
          setLoading(false);
          setLocating(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      mapInstance.current?.remove();
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div ref={mapRef} className="w-full h-[450px] rounded-xl border border-white/[0.065] z-0" />
        {locating && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#1a1510]/60 rounded-xl">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-cream">Detecting your location...</p>
              <p className="text-xs text-cream/40 mt-1">Allow location access when prompted</p>
            </div>
          </div>
        )}
        {userPos && (
          <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
            <button
              onClick={handleRefresh}
              disabled={searching}
              className="bg-ebony/90 backdrop-blur-sm border border-white/[0.065] text-cream p-2 rounded-lg hover:bg-primary-600/30 transition-all disabled:opacity-50"
              title="Refresh nearby places"
            >
              <RefreshCw className={`w-4 h-4 ${searching ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleRecenter}
              className="bg-ebony/90 backdrop-blur-sm border border-white/[0.065] text-cream p-2 rounded-lg hover:bg-primary-600/30 transition-all"
              title="Re-center on your location"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400 flex items-center gap-1"><Navigation className="w-4 h-4 shrink-0" />{error}</p>}

      {userPos && (
        <div className="flex items-center gap-2 text-xs text-cream/50">
          <Navigation className="w-3 h-3" />
          <span>
            {userPos.lat.toFixed(4)}, {userPos.lng.toFixed(4)}
            {userPos.acc > 0 && <span className="ml-1">(±{userPos.acc}m)</span>}
          </span>
        </div>
      )}

      {!locating && !error && places.length === 0 && dbSalons.length === 0 && !searching && (
        <p className="text-sm text-cream/55">No places found in your area. Try panning the map and clicking refresh.</p>
      )}

      {dbSalons.length > 0 && (
        <div>
          <p className="text-xs text-cream/40 mb-2 flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 bg-[#c9a84c] border border-[#800020] rounded-[3px]" />
            Our salons nearby ({dbSalons.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {dbSalons.slice(0, 8).map((s) => (
              <Link to={`/salons/${s.id}`} key={s.id} className="flex items-center gap-2 text-xs bg-ebony border border-white/[0.065] rounded px-2 py-1.5 text-cream/70 hover:border-primary-600/30 hover:text-cream transition-all">
                {s.logo ? (
                  <img src={s.logo} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-primary-600" />
                )}
                <span className="truncate">{s.name}</span>
                {s.averageRating > 0 && (
                  <span className="text-gold-500 shrink-0 ml-auto flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-current" />{s.averageRating.toFixed(1)}
                  </span>
                )}
              </Link>
            ))}
            {dbSalons.length > 8 && (
              <Link to="/salons" className="text-xs bg-ebony border border-white/[0.065] rounded px-2 py-1.5 text-primary-600 hover:text-primary-500 transition-colors flex items-center justify-center">
                +{dbSalons.length - 8} more
              </Link>
            )}
          </div>
        </div>
      )}

      {places.length > 0 && (
        <div>
          <p className="text-xs text-cream/40 mb-2">{places.length} places found on OpenStreetMap</p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {places.map((p) => (
              <span key={p.id} className="flex items-center gap-1 text-xs bg-ebony border border-white/[0.065] rounded px-2 py-1 text-cream/60">
                <span>{getTypeEmoji(p.type)}</span>
                <span>{p.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
