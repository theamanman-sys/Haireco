import { useEffect, useState } from 'react';
import api from '../services/api';
import { ShoppingBag, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '../i18n/useTranslate';

interface ProductSummary {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  shop: { shopName: string };
}

export default function Marketplace() {
  const t = useTranslate();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const params: any = {};
    if (category) params.category = category;
    api.get('/marketplace/products', { params })
      .then(({ data }) => setProducts(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  const categories = ['SHAMPOO', 'CONDITIONER', 'STYLING', 'HAIR_COLOR', 'TREATMENT', 'TOOLS', 'ACCESSORIES', 'SKINCARE', 'MAKEUP'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-cream" style={{ fontFamily: "'Playfair Display', serif" }}>{t('marketplace.title')}</h1>
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setCategory('')} className={`px-4 py-1.5 rounded text-xs tracking-widest uppercase transition-all duration-300 ${!category ? 'bg-primary-600 text-white' : 'text-cream/55 border border-white/10 hover:border-primary-600/30'}`}>{t('marketplace.all')}</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`px-4 py-1.5 rounded text-xs tracking-widest uppercase transition-all duration-300 ${category === c ? 'bg-primary-600 text-white' : 'text-cream/55 border border-white/10 hover:border-primary-600/30'}`}>{c}</button>
        ))}
      </div>
      {loading ? (
        <p className="text-cream/55">{t('marketplace.loading')}</p>
      ) : products.length === 0 ? (
        <p className="text-cream/55">{t('marketplace.noneFound')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="card hover:shadow-2xl transition-all duration-300 cursor-pointer hover:border-primary-600/30 group" onClick={() => navigate(`/marketplace/${p.id}`)}>
              <div className="bg-ebony rounded h-40 flex items-center justify-center mb-3 border border-white/[0.065]">
                <ShoppingBag className="w-10 h-10 text-cream/40 group-hover:text-primary-600 transition-colors" />
              </div>
              <h3 className="font-semibold text-sm text-cream mb-1">{p.name}</h3>
              <p className="text-xs text-cream/55 mb-2">{p.shop.shopName}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary-600">Br {p.price}</span>
                <span className="text-xs text-cream/40">{p.category}</span>
              </div>
              {p.stock < 10 && <p className="text-xs text-red-400 mt-1">{t('marketplace.onlyLeft')} {p.stock} left</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
