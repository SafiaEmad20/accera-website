'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [viewingCategory, setViewingCategory] = useState<string | null>(null);
  
  // 1. الـ Logic بتاع السلة
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (data) {
        const formattedData = data.map(item => ({
          ...item,
          price: `${item.price} EGP`,
          mainImage: item.image_url.startsWith('http') ? item.image_url : '/' + item.image_url,
        }));
        setProducts(formattedData);
      }
    };
    fetchProducts();
  }, []);

  // فانكشن إضافة منتج للسلة
  const addToCart = (product: any) => {
    setCart((prev) => [...prev, product]);
    setIsCartOpen(true);
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-[#355E61] text-[#F2EFE4] p-6">
      
      {/* الـ Header مع التوسيع mb-24 md:mb-32 */}
      <div className="flex items-center justify-between mb-24 md:mb-32 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/10 rounded-full cursor-pointer">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h2 className="text-3xl md:text-5xl font-serif border-l-[3px] border-white/30 pl-6 uppercase tracking-[0.3em]">
            {viewingCategory ? `${viewingCategory}s` : "Shop All"}
          </h2>
        </div>
        
        {/* أيقونة السلة */}
        <div className="relative cursor-pointer group">
          <ShoppingBag className="w-7 h-7 opacity-80 group-hover:opacity-100 transition-opacity" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#F2EFE4] text-[#355E61] text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {viewingCategory ? (
          /* --- منظر القسم الواحد (View All) --- */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setViewingCategory(null)} 
              className="mb-12 text-sm opacity-60 hover:opacity-100 underline flex items-center gap-2 cursor-pointer transition-all"
            >
              ← Back to All Collections
            </button>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {products.filter(p => p.category === viewingCategory).map(item => (
                <ProductItem key={item.id} item={item} onAdd={addToCart} />
              ))}
            </div>
          </div>
        ) : (
          /* --- منظر الـ Shop All (النبذة والـ VIEW ALL) --- */
          <div className="space-y-40"> {/* التوسيع الكبير بين الأقسام */}
            {categories.map((category) => (
              <div key={category} className="group">
                {/* السطر اللي فيه الاسم والزرار والخط الشفاف */}
                <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-[3px] h-10 bg-white/40"></div>
                    <h3 className="text-2xl md:text-3xl font-serif uppercase tracking-[0.2em]">{category}s</h3>
                  </div>
                  
                  {/* زرار VIEW ALL على اليمين بالظبط */}
                  <button 
                    onClick={() => { setViewingCategory(category); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                    className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all cursor-pointer"
                  >
                    VIEW ALL
                  </button>
                </div>

                {/* عرض النبذة (أول 4 قطع بس) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
                  {products.filter(p => p.category === category).slice(0, 4).map(item => (
                    <ProductItem key={item.id} item={item} onAdd={addToCart} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// كود الكارت مع زرار الـ Quick Add
function ProductItem({ item, onAdd }: any) {
  return (
    <div className="text-center group">
      <div className="aspect-[3/4] overflow-hidden rounded-sm mb-4 relative bg-white/5 shadow-2xl">
        <img src={item.mainImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
        
        {/* زرار الإضافة للسلة */}
        <button 
          onClick={(e) => { e.stopPropagation(); onAdd(item); }}
          className="absolute bottom-0 left-0 w-full bg-[#F2EFE4] text-[#355E61] py-4 text-[10px] font-bold uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer z-10"
        >
          Quick Add +
        </button>
      </div>
      <h4 className="text-sm uppercase tracking-widest opacity-80 mb-2 font-medium">{item.name}</h4>
      <p className="text-xs opacity-50 tracking-wider">{item.price}</p>
    </div>
  );
}