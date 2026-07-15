import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Star, MapPin, Clock, Phone, Scissors, User, Globe, ExternalLink, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslate } from '../i18n/useTranslate';
import { loadGoogleMaps } from '../services/maps';

interface SalonDetailData {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  totalReviews: number;
  logo: string;
  coverImage: string;
  images: string[];
  workingHours: any;
  services: { id: string; name: string; description: string; duration: number; price: number; category: string }[];
  staffMembers: { id: string; position: string; user: { firstName: string; lastName: string; avatar: string } }[];
  reviews: { id: string; rating: number; comment: string; createdAt: string; customer: { firstName: string; lastName: string; avatar: string } }[];
  _count: { reviews: number; bookings: number };
}

function LocationMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const mapEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: google.maps.Map;
    (async () => {
      await loadGoogleMaps();
      if (!mapEl.current) return;
      map = new google.maps.Map(mapEl.current, {
        center: { lat, lng },
        zoom: 15,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1a1510' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2520' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1610' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1e1a14' }] },
        ],
        disableDefaultUI: true,
        zoomControl: false,
        gestureHandling: 'cooperative',
      });
      new google.maps.Marker({
        position: { lat, lng },
        map,
        title: name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#800020',
          fillOpacity: 1,
          strokeColor: '#c9a84c',
          strokeWeight: 3,
        },
      });
    })();
  }, [lat, lng, name]);

  return <div ref={mapEl} className="w-full h-48 rounded-lg border border-white/[0.065]" />;
}

export default function SalonDetail() {
  const t = useTranslate();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [salon, setSalon] = useState<SalonDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [bookingDate, setBookingDate] = useState('');

  useEffect(() => {
    api.get(`/salons/${id}`)
      .then(({ data }) => setSalon(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!selectedService || !bookingDate) { toast.error(t('salonDetail.selectServiceAndDate')); return; }
    try {
      await api.post('/bookings', {
        salonId: id,
        serviceId: selectedService,
        professionalId: selectedProfessional || undefined,
        startTime: bookingDate,
      });
      toast.success(t('salonDetail.bookingCreated'));
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('salonDetail.bookingFailed'));
    }
  };

  if (loading) return <div className="text-center py-20 text-cream/55">{t('salonDetail.loading')}</div>;
  if (!salon) return <div className="text-center py-20 text-cream/55">{t('salonDetail.notFound')}</div>;

  const hasCoords = salon.latitude && salon.longitude;
  const mapsUrl = hasCoords ? `https://www.google.com/maps?q=${salon.latitude},${salon.longitude}` : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {salon.coverImage && (
        <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-6 border border-white/[0.065]">
          <img src={salon.coverImage} alt={salon.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/80 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            {salon.logo && <img src={salon.logo} alt="" className="w-14 h-14 rounded-full border-2 border-cream/30 object-cover" />}
            <div>
              <h1 className="text-3xl font-bold text-cream" style={{ fontFamily: "'Playfair Display', serif" }}>{salon.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-cream/70">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{salon.address}, {salon.city}</span>
                {salon.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{salon.phone}</span>}
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-gold-500" />{salon.averageRating.toFixed(1)} ({salon.totalReviews} {t('salonDetail.reviews')})</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {!salon.coverImage && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {salon.logo && <img src={salon.logo} alt="" className="w-14 h-14 rounded-full border-2 border-white/[0.065] object-cover" />}
            <div>
              <h1 className="text-3xl font-bold text-cream" style={{ fontFamily: "'Playfair Display', serif" }}>{salon.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-cream/55">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{salon.address}, {salon.city}</span>
                {salon.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{salon.phone}</span>}
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-gold-500" />{salon.averageRating.toFixed(1)} ({salon.totalReviews} {t('salonDetail.reviews')})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {salon.description && (
            <div className="card">
              <h2 className="font-semibold mb-2 text-cream">{t('salonDetail.about')}</h2>
              <p className="text-cream/55 text-sm">{salon.description}</p>
            </div>
          )}

          {hasCoords && (
            <div className="card">
              <h2 className="font-semibold mb-3 flex items-center gap-2 text-cream"><MapPin className="w-4 h-4" /> Location</h2>
              <LocationMap lat={salon.latitude} lng={salon.longitude} name={salon.name} />
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={mapsUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-primary-600/20 text-primary-600 px-3 py-1.5 rounded hover:bg-primary-600/30 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Open in Google Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-xs text-cream/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {salon.latitude.toFixed(5)}, {salon.longitude.toFixed(5)}
                </span>
              </div>
            </div>
          )}

          <div className="card">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-cream"><Scissors className="w-4 h-4" /> {t('salonDetail.servicesPricing')}</h2>
            <div className="space-y-3">
              {salon.services.map((s) => (
                <label key={s.id} className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-all duration-300 ${selectedService === s.id ? 'border-primary-600 bg-primary-600/10' : 'border-white/[0.065] hover:border-white/20'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="service" value={s.id} checked={selectedService === s.id} onChange={() => setSelectedService(s.id)} className="accent-primary-600" />
                    <div>
                      <div className="font-medium text-sm text-cream">{s.name}</div>
                      <div className="text-xs text-cream/55">{s.duration} {t('salonDetail.min')}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-primary-600">Br {s.price}</div>
                </label>
              ))}
            </div>
          </div>

          {salon.reviews.length > 0 && (
            <div className="card">
              <h2 className="font-semibold mb-4 text-cream">{t('salonDetail.reviews')}</h2>
              <div className="space-y-4">
                {salon.reviews.map((r) => (
                  <div key={r.id} className="border-b border-white/[0.065] pb-3 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-5 h-5 text-cream/40" />
                      <span className="text-sm font-medium text-cream">{r.customer.firstName} {r.customer.lastName}</span>
                      <div className="flex items-center gap-0.5 text-gold-500">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</div>
                    </div>
                    {r.comment && <p className="text-sm text-cream/55 ml-7">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card sticky top-24 space-y-4">
            {salon.phone && (
              <a href={`tel:${salon.phone}`} className="flex items-center gap-2 text-sm text-cream/70 hover:text-primary-600 transition-colors">
                <Phone className="w-4 h-4 text-primary-600" />
                <span>{salon.phone}</span>
              </a>
            )}
            {salon.website && (
              <a href={salon.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-cream/70 hover:text-primary-600 transition-colors">
                <Globe className="w-4 h-4 text-primary-600" />
                <span className="truncate">{salon.website.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
            {salon.address && (
              <div className="flex items-start gap-2 text-sm text-cream/70">
                <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <span>{salon.address}, {salon.city}</span>
              </div>
            )}
            {hasCoords && mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-500 transition-colors">
                <Navigation className="w-4 h-4" />
                <span>View on Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <hr className="border-white/[0.065]" />

            <h2 className="font-semibold text-cream" style={{ fontFamily: "'Playfair Display', serif" }}>{t('salonDetail.bookAppointment')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cream/70 mb-1">{t('salonDetail.service')}</label>
                <select className="input-field" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                  <option value="">{t('salonDetail.selectService')}</option>
                  {salon.services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} - Br {s.price}</option>
                  ))}
                </select>
              </div>
              {salon.staffMembers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-cream/70 mb-1">{t('salonDetail.professionalOptional')}</label>
                  <select className="input-field" value={selectedProfessional} onChange={(e) => setSelectedProfessional(e.target.value)}>
                    <option value="">{t('salonDetail.anyProfessional')}</option>
                    {salon.staffMembers.map((s) => (
                      <option key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName} - {s.position}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-cream/70 mb-1">{t('salonDetail.dateTime')}</label>
                <input type="datetime-local" className="input-field" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
              </div>
              <button onClick={handleBook} className="btn-primary w-full">
                {t('salonDetail.bookNow')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
