import { useTranslate } from '../../i18n/useTranslate';

export default function Footer() {
  const t = useTranslate();

  return (
    <footer className="bg-void border-t border-white/[0.065] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-primary-600 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>HairEco</h3>
            <p className="text-sm text-cream/55">{t('footer.tagline')}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-cream/70 mb-3">{t('footer.forCustomers')}</h4>
            <ul className="space-y-2 text-sm text-cream/55">
              <li>{t('footer.findSalons')}</li>
              <li>{t('footer.bookAppointments')}</li>
              <li>{t('footer.shopProducts')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-cream/70 mb-3">{t('footer.forProfessionals')}</h4>
            <ul className="space-y-2 text-sm text-cream/55">
              <li>{t('footer.findJobs')}</li>
              <li>{t('footer.createPortfolio')}</li>
              <li>{t('footer.getVerified')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-cream/70 mb-3">{t('footer.forOwners')}</h4>
            <ul className="space-y-2 text-sm text-cream/55">
              <li>{t('footer.listYourSalon')}</li>
              <li>{t('footer.staffManagement')}</li>
              <li>{t('footer.revenueAnalytics')}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.065] mt-8 pt-4 text-center text-sm text-cream/40">
          &copy; {new Date().getFullYear()} HairEco. {t('footer.allRightsReserved')}
        </div>
      </div>
    </footer>
  );
}
