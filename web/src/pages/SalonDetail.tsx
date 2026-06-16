import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Star, MapPin, Clock, Phone, Scissors, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface SalonDetailData {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  averageRating: number;
  totalReviews: number;
  logo: string;
  images: string[];
  workingHours: any;
  services: { id: string; name: string; description: string; duration: number; price: number; category: string }[];
  staffMembers: { id: string; position: string; user: { firstName: string; lastName: string; avatar: string } }[];
  reviews: { id: string; rating: number; comment: string; createdAt: string; customer: { firstName: string; lastName: string; avatar: string } }[];
  _count: { reviews: number; bookings: number };
}

export default function SalonDetail() {
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
    if (!selectedService || !bookingDate) { toast.error('Select a service and date'); return; }
    try {
      await api.post('/bookings', {
        salonId: id,
        serviceId: selectedService,
        professionalId: selectedProfessional || undefined,
        startTime: bookingDate,
      });
      toast.success('Booking created! Pay deposit to confirm.');
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) return <div className="text-center py-20 text-cream/55">Loading...</div>;
  if (!salon) return <div className="text-center py-20 text-cream/55">Salon not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-cream" style={{ fontFamily: "'Playfair Display', serif" }}>{salon.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-cream/55">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{salon.address}, {salon.city}</span>
              <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{salon.phone}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-gold-500" />{salon.averageRating.toFixed(1)} ({salon.totalReviews} reviews)</span>
            </div>
          </div>

          {salon.description && (
            <div className="card">
              <h2 className="font-semibold mb-2 text-cream">About</h2>
              <p className="text-cream/55 text-sm">{salon.description}</p>
            </div>
          )}

          <div className="card">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-cream"><Scissors className="w-4 h-4" /> Services & Pricing</h2>
            <div className="space-y-3">
              {salon.services.map((s) => (
                <label key={s.id} className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-all duration-300 ${selectedService === s.id ? 'border-primary-600 bg-primary-600/10' : 'border-white/[0.065] hover:border-white/20'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="service" value={s.id} checked={selectedService === s.id} onChange={() => setSelectedService(s.id)} className="accent-primary-600" />
                    <div>
                      <div className="font-medium text-sm text-cream">{s.name}</div>
                      <div className="text-xs text-cream/55">{s.duration} min</div>
                    </div>
                  </div>
                  <div className="font-semibold text-primary-600">Br {s.price}</div>
                </label>
              ))}
            </div>
          </div>

          {salon.reviews.length > 0 && (
            <div className="card">
              <h2 className="font-semibold mb-4 text-cream">Reviews</h2>
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
          <div className="card sticky top-24">
            <h2 className="font-semibold mb-4 text-cream" style={{ fontFamily: "'Playfair Display', serif" }}>Book Appointment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cream/70 mb-1">Service</label>
                <select className="input-field" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                  <option value="">Select a service</option>
                  {salon.services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} - Br {s.price}</option>
                  ))}
                </select>
              </div>
              {salon.staffMembers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-cream/70 mb-1">Professional (optional)</label>
                  <select className="input-field" value={selectedProfessional} onChange={(e) => setSelectedProfessional(e.target.value)}>
                    <option value="">Any professional</option>
                    {salon.staffMembers.map((s) => (
                      <option key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName} - {s.position}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-cream/70 mb-1">Date & Time</label>
                <input type="datetime-local" className="input-field" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
              </div>
              <button onClick={handleBook} className="btn-primary w-full">
                Book Now (20% Deposit)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
