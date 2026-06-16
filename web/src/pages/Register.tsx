import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { useTranslate } from '../i18n/useTranslate';

export default function Register() {
  const t = useTranslate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'CUSTOMER' });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const roles = [
    { value: 'CUSTOMER', label: t('register.customer'), desc: t('register.customerDesc') },
    { value: 'PROFESSIONAL', label: t('register.professional'), desc: t('register.professionalDesc') },
    { value: 'SALON_OWNER', label: t('register.salonOwner'), desc: t('register.salonOwnerDesc') },
    { value: 'SHOP', label: t('register.shopOwner'), desc: t('register.shopOwnerDesc') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success(t('register.success'));
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="card max-w-lg w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-cream" style={{ fontFamily: "'Playfair Display', serif" }}>{t('register.title')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream/70 mb-1">{t('register.firstName')}</label>
              <input className="input-field" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream/70 mb-1">{t('register.lastName')}</label>
              <input className="input-field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-cream/70 mb-1">{t('register.email')}</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream/70 mb-1">{t('register.phone')}</label>
            <input type="tel" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream/70 mb-1">{t('register.password')}</label>
            <input type="password" autoComplete="new-password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream/70 mb-2">{t('register.iAmA')}</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <button type="button" key={r.value} onClick={() => setForm({ ...form, role: r.value })}
                  className={`p-3 text-left rounded border text-sm transition-all duration-300 ${form.role === r.value ? 'border-primary-600 bg-primary-600/10 text-primary-400' : 'border-white/10 hover:border-white/20 text-cream/55'}`}>
                  <div className="font-medium">{r.label}</div>
                  <div className="text-xs text-cream/40">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? t('register.loading') : t('register.button')}
          </button>
        </form>
        <p className="text-center text-sm text-cream/55 mt-4">
          {t('register.haveAccount')} <Link to="/login" className="text-primary-600 hover:text-gold-500 transition-colors">{t('register.login')}</Link>
        </p>
      </div>
    </div>
  );
}
