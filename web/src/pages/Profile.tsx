import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Calendar, Star, ShoppingBag, Briefcase, User as UserIcon, MapPin } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my')
      .then(({ data }) => setBookings(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-600/15 rounded-full flex items-center justify-center border border-primary-600/30">
            <UserIcon className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cream">{user?.firstName} {user?.lastName}</h1>
            <p className="text-sm text-cream/55">{user?.email} | {user?.phone}</p>
            <span className="inline-block mt-1 text-xs bg-primary-600/15 text-primary-400 px-2 py-0.5 rounded border border-primary-600/20">{user?.role}</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-cream"><Calendar className="w-5 h-5" /> My Bookings</h2>
      {loading ? (
        <p className="text-cream/55">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-cream/55">No bookings yet.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium text-cream">{b.service?.name}</div>
                <div className="text-sm text-cream/55">{b.salon?.name} - {b.salon?.address}</div>
                <div className="text-xs text-cream/40 mt-1">{new Date(b.startTime).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-cream">Br {b.totalAmount}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400' : b.status === 'CONFIRMED' ? 'bg-blue-900/30 text-blue-400' : b.status === 'CANCELLED' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{b.status}</span>
                {b.deposit?.status && <div className="text-xs text-cream/40 mt-1">Deposit: {b.deposit.status}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
