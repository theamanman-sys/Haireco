import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, Scissors, TrendingUp, Clock, Building2 } from 'lucide-react';

interface DashboardData {
  salons: { id: string; name: string; city: string; isActive: boolean }[];
  todayBookings: number;
  totalRevenue: number;
  activeStaff: number;
  recentBookings: { id: string; customer: { firstName: string; lastName: string }; service: { name: string }; startTime: string; status: string }[];
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/salons'),
      api.get('/bookings/my'),
    ]).then(([salonsRes, bookingsRes]) => {
      setData({
        salons: salonsRes.data.data,
        todayBookings: bookingsRes.data.data.filter((b: any) => new Date(b.startTime).toDateString() === new Date().toDateString()).length,
        totalRevenue: bookingsRes.data.data.filter((b: any) => b.status === 'COMPLETED').reduce((sum: number, b: any) => sum + b.totalAmount, 0),
        activeStaff: 0,
        recentBookings: bookingsRes.data.data.slice(0, 5),
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (user?.role !== 'SALON_OWNER') {
    return <div className="text-center py-20 text-cream/55">This dashboard is for salon owners.</div>;
  }

  if (loading) return <div className="text-center py-20 text-cream/55">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-cream" style={{ fontFamily: "'Playfair Display', serif" }}>Owner Dashboard</h1>
        <Link to="/register?role=SALON_OWNER" className="btn-primary">Add New Salon</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-cream">{data?.todayBookings || 0}</span>
          </div>
          <p className="text-sm text-cream/55">Today's Bookings</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-gold-500" />
            <span className="text-2xl font-bold text-cream">Br {data?.totalRevenue?.toLocaleString() || 0}</span>
          </div>
          <p className="text-sm text-cream/55">Total Revenue</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-cream">{data?.activeStaff || 0}</span>
          </div>
          <p className="text-sm text-cream/55">Active Staff</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Scissors className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-cream">{data?.salons?.length || 0}</span>
          </div>
          <p className="text-sm text-cream/55">My Salons</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-cream"><Building2 className="w-4 h-4" /> My Salons</h2>
          {data?.salons?.length === 0 ? (
            <p className="text-sm text-cream/55">No salons yet. Create your first one!</p>
          ) : (
            <div className="space-y-3">
              {data?.salons?.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded border border-white/[0.065]">
                  <div>
                    <div className="font-medium text-cream">{s.name}</div>
                    <div className="text-xs text-cream/55">{s.city}</div>
                  </div>
                  <Link to={`/salons/${s.id}`} className="text-sm text-primary-600 hover:text-gold-500 transition-colors">View</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-cream"><Clock className="w-4 h-4" /> Recent Bookings</h2>
          {data?.recentBookings?.length === 0 ? (
            <p className="text-sm text-cream/55">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {data?.recentBookings?.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded border border-white/[0.065]">
                  <div>
                    <div className="text-sm font-medium text-cream">{b.customer?.firstName} {b.customer?.lastName}</div>
                    <div className="text-xs text-cream/55">{b.service?.name} - {new Date(b.startTime).toLocaleString()}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${b.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400' : b.status === 'CONFIRMED' ? 'bg-blue-900/30 text-blue-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
