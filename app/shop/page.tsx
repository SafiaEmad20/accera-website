'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // اتأكدي من المسار صح
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link'; // السر هنا عشان الـ Back يشتغل

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);

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

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-[#355E61] text-[#F2EFE4] p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-3xl font-serif border-l-4 border-white/20 pl-4 uppercase tracking-widest">Shop All</h2>
      </div>

      <div className="space-y-16">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-2xl font-serif mb-6 border-b border-white/10 pb-2 uppercase tracking-widest">{category}s</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* هنا هتحطي الـ SmallCard Component بتاعك */}
               {products.filter(p => p.category === category).map(item => (
                 <div key={item.id} className="text-center">
                    <img src={item.mainImage} className="aspect-[3/4] object-cover rounded-sm mb-2" />
                    <h4 className="text-sm uppercase tracking-tighter">{item.name}</h4>
                    <p className="text-xs opacity-50">{item.price}</p>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}