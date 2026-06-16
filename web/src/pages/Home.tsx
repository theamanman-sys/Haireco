import { Link } from 'react-router-dom';
import { Scissors, ShoppingBag, Briefcase, Calendar, Star, Users } from 'lucide-react';

const features = [
  { icon: Calendar, title: 'Easy Booking', desc: 'Book appointments with real-time availability and transparent pricing.' },
  { icon: Star, title: 'Verified Pros', desc: 'Find verified beauty professionals with portfolios and reviews.' },
  { icon: ShoppingBag, title: 'Shop Products', desc: 'Browse cosmetics and hair products from trusted shops.' },
  { icon: Briefcase, title: 'Talent Hub', desc: 'Post jobs or find your next opportunity in beauty.' },
  { icon: Users, title: 'Queue Management', desc: 'Real-time queue tracking so you never wait long.' },
  { icon: Scissors, title: 'Salon Dashboard', desc: 'Manage staff, track revenue, and control inventory.' },
];

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-700 via-primary-800 to-void text-cream">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your Complete Beauty & Salon Ecosystem
            </h1>
            <p className="text-lg sm:text-xl text-cream/70 mb-10">
              Book appointments, shop products, find jobs, and grow your beauty business — all in one place.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/salons" className="bg-cream text-primary-700 px-8 py-3 rounded font-semibold tracking-widest uppercase text-xs hover:bg-transparent hover:text-cream border border-cream transition-all duration-300">
                Find a Salon
              </Link>
              <Link to="/register" className="border border-cream/30 text-cream px-8 py-3 rounded font-semibold tracking-widest uppercase text-xs hover:border-primary-600 transition-all duration-300">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>Everything You Need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="card hover:shadow-2xl transition-shadow">
              <f.icon className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-cream">{f.title}</h3>
              <p className="text-cream/55 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ebony py-16 border-t border-white/[0.065]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>For Salon Owners</h2>
          <p className="text-cream/55 mb-8 max-w-2xl mx-auto">
            Get powerful tools to manage your salon, staff, inventory, and revenue. 
            Subscription plans start free.
          </p>
          <Link to="/register?role=SALON_OWNER" className="btn-primary text-lg px-8 py-3">
            List Your Salon
          </Link>
        </div>
      </section>
    </div>
  );
}
