import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadGoogleMaps, fetchNearbyDbSalons, type DbSalon } from '../../services/maps';
import { useTranslate } from '../../i18n/useTranslate';
import { Star, MapPin, Navigation, RefreshCw, Crosshair } from 'lucide-react';

export default function NearbyMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const accCircleRef = useRef<google.maps.Circle | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const [dbSalons, setDbSalons] = useState<DbSalon[]>([]);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(true);
  const t = useTranslate();

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  }, []);

  const createMarkerIcon = () => {
    return {
      path: google.maps.SymbolPath.SQUARE,
      scale: 7,
      fillColor: '#c9a84c',
      fillOpacity: 1,
      strokeColor: '#800020',
      strokeWeight: 2,
    };
  };

  const fetchAndPlace = useCallback(async (map: google.maps.Map, lat: number, lng: number) => {
    setSearching(true);
    clearMarkers();

    try {
      const dbResults = await fetchNearbyDbSalons(lat, lng, 50);

      setDbSalons(dbResults);

      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(lat, lng));

      const infoWindow = new google.maps.InfoWindow();

      dbResults.forEach((salon) => {
        if (!salon.latitude || !salon.longitude) return;
        const pos = new google.maps.LatLng(salon.latitude, salon.longitude);
        bounds.extend(pos);
        const marker = new google.maps.Marker({
          position: pos,
          map,
          icon: createMarkerIcon(),
          title: salon.name,
        });
        marker.addListener('click', () => {
          infoWindow.setContent(`
            <div style="color:#1a1510;font-size:13px;max-width:220px;font-family:system-ui">
              ${salon.coverImage ? `<img src="${salon.coverImage}" alt="${salon.name}" style="width:100%;height:80px;object-fit:cover;border-radius:4px;margin-bottom:6px" />` : ''}
              <strong>${salon.name}</strong><br/>
              <span style="color:#666;font-size:11px">${salon.address}</span><br/>
              ${salon.averageRating ? `<span style="color:#d4a000">\u2605 ${salon.averageRating.toFixed(1)}</span>` : ''}
              <br/><a href="/salons/${salon.id}" style="color:#800020;font-size:12px;text-decoration:underline">View details \u2192</a>
            </div>
          `);
          infoWindow.open(map, marker);
        });
        markersRef.current.push(marker);
      });

      map.fitBounds(bounds, 60);
      if (dbResults.length === 0) map.setCenter(new google.maps.LatLng(lat, lng));
    } catch {
      // silent
    } finally {
      setSearching(false);
    }
  }, [clearMarkers]);

  const updateUserLocation = useCallback(async (map: google.maps.Map, lat: number, lng: number, accuracy: number) => {
    setUserPos({ lat, lng, acc: Math.round(accuracy) });

    if (userMarkerRef.current) userMarkerRef.current.setMap(null);
    if (accCircleRef.current) accCircleRef.current.setMap(null);

    userMarkerRef.current = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#800020',
        fillOpacity: 1,
        strokeColor: '#c9a84c',
        strokeWeight: 3,
      },
      zIndex: 9999,
      title: 'You are here',
    });

    if (accuracy < 500) {
      accCircleRef.current = new google.maps.Circle({
        center: new google.maps.LatLng(lat, lng),
        radius: accuracy,
        map,
        fillColor: '#800020',
        fillOpacity: 0.08,
        strokeColor: '#800020',
        strokeOpacity: 0.3,
        strokeWeight: 1,
      });
    }
  }, []);

  const startWatching = useCallback(async (map: google.maps.Map) => {
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

        await updateUserLocation(map, lat, lng, accuracy);

        if (firstFix) {
          map.setCenter(new google.maps.LatLng(lat, lng));
          map.setZoom(14);
          firstFix = false;
          await fetchAndPlace(map, lat, lng);
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
    await fetchAndPlace(mapInstance.current, userPos.lat, userPos.lng);
  }, [userPos, fetchAndPlace]);

  const handleRecenter = useCallback(() => {
    if (!mapInstance.current || !userPos) return;
    mapInstance.current.panTo(new google.maps.LatLng(userPos.lat, userPos.lng));
    mapInstance.current.setZoom(14);
  }, [userPos]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadGoogleMaps();
        if (!mapRef.current || cancelled) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 9.03, lng: 38.74 },
          zoom: 13,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1a1510' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1510' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2520' }] },
            { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6b6b6b' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1610' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
            { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2520' }] },
            { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1e1a14' }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
        });
        mapInstance.current = map;

        await startWatching(map);
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
      markersRef.current.forEach((m) => m.setMap(null));
      userMarkerRef.current?.setMap(null);
      accCircleRef.current?.setMap(null);
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
            {userPos.acc > 0 && <span className="ml-1">(\u00B1{userPos.acc}m)</span>}
          </span>
        </div>
      )}

      {!locating && !error && dbSalons.length === 0 && !searching && (
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
                {s.distance !== undefined && (
                  <span className="text-cream/40 shrink-0 ml-auto">{s.distance < 1 ? `${Math.round(s.distance * 1000)}m` : `${s.distance.toFixed(1)}km`}</span>
                )}
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

    </div>
  );
}
