import { useEffect, useState } from 'react';
import api from '../services/api';
import { Megaphone, DollarSign, Calendar, Eye, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Ad {
  id: string;
  title: string;
  type: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  impressions?: number;
  clicks?: number;
  salon: { name: string };
}

export default function Ads() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ads')
      .then(({ data }) => setAds(data.data || []))
      .catch(() => setAds([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cream" style={{ fontFamily: "'Playfair Display', serif" }}>Advertise</h1>
          <p className="text-cream/55 mt-1">Promote your salon or products to thousands of potential customers.</p>
        </div>
        <Link to="/ads/create" className="btn-primary">Create Campaign</Link>
      </div>

      {loading ? (
        <p className="text-cream/55">Loading campaigns...</p>
      ) : ads.length === 0 ? (
        <div className="card text-center py-16">
          <Megaphone className="w-12 h-12 mx-auto mb-4 text-cream/20" />
          <h2 className="text-xl font-semibold text-cream mb-2">No campaigns yet</h2>
          <p className="text-cream/55 mb-6">Launch your first advertising campaign to reach more customers.</p>
          <Link to="/ads/create" className="btn-primary">Start Advertising</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-cream">{ad.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ad.status === 'ACTIVE' ? 'bg-green-900/30 text-green-400' : ad.status === 'PAUSED' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-900/30 text-gray-400'}`}>{ad.status}</span>
              </div>
              <p className="text-sm text-cream/55 mb-3">{ad.salon?.name}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-cream/55"><DollarSign className="w-3 h-3" />Br {ad.budget}</div>
                <div className="flex items-center gap-2 text-cream/55"><Calendar className="w-3 h-3" />{ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'Ongoing'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
