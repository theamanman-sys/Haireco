import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Scissors,
  ShoppingBag,
  Briefcase,
  Megaphone,
  LogOut,
  User,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslate } from '../../i18n/useTranslate';
import { useLanguageStore } from '../../store/languageStore';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslate();
  const { lang, toggleLang } = useLanguageStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-void/82 backdrop-blur-2xl border-b border-white/[0.065] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <Scissors className="w-6 h-6" />
            HairEco
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/salons" className="flex items-center gap-1 text-sm text-cream/55 hover:text-primary-600">
              <Scissors className="w-4 h-4" /> {t('nav.salons')}
            </Link>
            <Link to="/marketplace" className="flex items-center gap-1 text-sm text-cream/55 hover:text-primary-600">
              <ShoppingBag className="w-4 h-4" /> {t('nav.shop')}
            </Link>
            <Link to="/jobs" className="flex items-center gap-1 text-sm text-cream/55 hover:text-primary-600">
              <Briefcase className="w-4 h-4" /> {t('nav.jobs')}
            </Link>
            <Link to="/ads" className="flex items-center gap-1 text-sm text-cream/55 hover:text-primary-600">
              <Megaphone className="w-4 h-4" /> {t('nav.ads')}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="text-xs font-semibold tracking-widest uppercase bg-ebony border border-white/10 hover:border-primary-600/30 text-cream/70 hover:text-primary-600 px-2.5 py-1.5 rounded transition-all duration-300"
            >
              {lang === 'en' ? t('language.am') : t('language.en')}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user?.role === 'SALON_OWNER' ? '/dashboard' : '/profile'}
                  className="flex items-center gap-2 text-sm text-cream/55 hover:text-primary-600"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.firstName}</span>
                </Link>
                <button onClick={handleLogout} className="btn-secondary !p-2">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary text-sm">{t('nav.register')}</Link>
              </div>
            )}
            <button className="md:hidden text-cream" onClick={() => setIsOpen(!isOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-white/[0.065] bg-void/95 backdrop-blur-2xl">
            <div className="px-4 py-4 space-y-3">
              <Link to="/salons" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm text-cream/55 hover:text-primary-600 py-2">
                <Scissors className="w-4 h-4" /> {t('nav.salons')}
              </Link>
              <Link to="/marketplace" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm text-cream/55 hover:text-primary-600 py-2">
                <ShoppingBag className="w-4 h-4" /> {t('nav.shop')}
              </Link>
              <Link to="/jobs" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm text-cream/55 hover:text-primary-600 py-2">
                <Briefcase className="w-4 h-4" /> {t('nav.jobs')}
              </Link>
              <Link to="/ads" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm text-cream/55 hover:text-primary-600 py-2">
                <Megaphone className="w-4 h-4" /> {t('nav.ads')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
