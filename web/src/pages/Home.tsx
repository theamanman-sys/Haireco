import { Link } from 'react-router-dom';
import { Scissors, ShoppingBag, Briefcase, Calendar, Star, Users } from 'lucide-react';
import { useTranslate } from '../i18n/useTranslate';

export default function Home() {
  const t = useTranslate();

  const features = [
    { icon: Calendar, title: t('home.easyBooking'), desc: t('home.easyBookingDesc') },
    { icon: Star, title: t('home.verifiedPros'), desc: t('home.verifiedProsDesc') },
    { icon: ShoppingBag, title: t('home.shopProducts'), desc: t('home.shopProductsDesc') },
    { icon: Briefcase, title: t('home.talentHub'), desc: t('home.talentHubDesc') },
    { icon: Users, title: t('home.queueManagement'), desc: t('home.queueManagementDesc') },
    { icon: Scissors, title: t('home.salonDashboard'), desc: t('home.salonDashboardDesc') },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-700 via-primary-800 to-void text-cream">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-cream/70 mb-10">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/salons" className="bg-cream text-primary-700 px-8 py-3 rounded font-semibold tracking-widest uppercase text-xs hover:bg-transparent hover:text-cream border border-cream transition-all duration-300">
                {t('home.findSalon')}
              </Link>
              <Link to="/register" className="border border-cream/30 text-cream px-8 py-3 rounded font-semibold tracking-widest uppercase text-xs hover:border-primary-600 transition-all duration-300">
                {t('home.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>{t('home.everythingYouNeed')}</h2>
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
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{t('home.forOwners')}</h2>
          <p className="text-cream/55 mb-8 max-w-2xl mx-auto">
            {t('home.forOwnersDesc')}
          </p>
          <Link to="/register?role=SALON_OWNER" className="btn-primary text-lg px-8 py-3">
            {t('home.listYourSalon')}
          </Link>
        </div>
      </section>
    </div>
  );
}
