import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Star, MapPin, Scissors } from 'lucide-react';
import { useTranslate } from '../i18n/useTranslate';

interface SalonSummary {
  id: string;
  name: string;
  address: string;
  city: string;
  logo?: string;
  averageRating: number;
  totalReviews: number;
  services: { id: string; name: string; price: number }[];
  _count: { reviews: number };
}

export default function Salons() {
  const t = useTranslate();
  const [salons, setSalons] = useState<SalonSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: any = {};
    if (search) params.city = search;
    api.get('/salons', { params })
      .then(({ data }) => setSalons(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-cream" style={{ fontFamily: "'Playfair Display', serif" }}>{t('salons.title')}</h1>
      <div className="relative max-w-md mb-8">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
        <input
          type="text"
          placeholder={t('salons.searchPlaceholder')}
          className="input-field pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <p className="text-cream/55">{t('salons.loading')}</p>
      ) : salons.length === 0 ? (
        <p className="text-cream/55">{t('salons.noneFound')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.map((salon) => (
            <Link to={`/salons/${salon.id}`} key={salon.id} className="card hover:shadow-2xl transition-all duration-300 group hover:border-primary-600/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-cream group-hover:text-primary-600 transition-colors">{salon.name}</h3>
                  <p className="text-sm text-cream/55 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {salon.address}, {salon.city}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm bg-gold-50/10 text-gold-500 px-2 py-1 rounded">
                  <Star className="w-3 h-3 fill-current" />
                  {salon.averageRating.toFixed(1)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {salon.services.slice(0, 3).map((s) => (
                  <span key={s.id} className="text-xs bg-white/5 text-cream/55 px-2 py-1 rounded-full">
                    {s.name} - Br {s.price}
                  </span>
                ))}
                {salon.services.length > 3 && (
                  <span className="text-xs text-cream/40">+{salon.services.length - 3} {t('salons.more')}</span>
                )}
              </div>
              <p className="text-xs text-cream/40">{salon._count.reviews} {t('salons.reviews')}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
