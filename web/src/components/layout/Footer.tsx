export default function Footer() {
  return (
    <footer className="bg-void border-t border-white/[0.065] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-primary-600 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>HairEco</h3>
            <p className="text-sm text-cream/55">
              Connecting salons, professionals, and beauty lovers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-cream/70 mb-3">For Customers</h4>
            <ul className="space-y-2 text-sm text-cream/55">
              <li>Find Salons</li>
              <li>Book Appointments</li>
              <li>Shop Products</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-cream/70 mb-3">For Professionals</h4>
            <ul className="space-y-2 text-sm text-cream/55">
              <li>Find Jobs</li>
              <li>Create Portfolio</li>
              <li>Get Verified</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-cream/70 mb-3">For Owners</h4>
            <ul className="space-y-2 text-sm text-cream/55">
              <li>List Your Salon</li>
              <li>Staff Management</li>
              <li>Revenue Analytics</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.065] mt-8 pt-4 text-center text-sm text-cream/40">
          &copy; {new Date().getFullYear()} HairEco. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
