'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, Loader, Plus, X } from 'lucide-react';

export default function AdminPage() {
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'Necklace', material: 'stainless steel', sizes: ''
  });

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [variantImages, setVariantImages] = useState<{[key: string]: { main: File | null, hover: File | null, mainPreview: string | null, hoverPreview: string | null }}>({});
  const [loading, setLoading] = useState(false);

  // 👇 دي قايمة الألوان اللي هتظهرلك (ضفنا الأسود والأبيض)
  const AVAILABLE_COLORS = [
    { name: 'Gold', hex: '#D4AF37', style: 'text-[#D4AF37]' },
    { name: 'Silver', hex: '#C0C0C0', style: 'text-gray-500' },
    { name: 'Black', hex: '#000000', style: 'text-black' },
    { name: 'White', hex: '#FFFFFF', style: 'text-gray-400' }, 
  ];

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
      const newImages = { ...variantImages };
      delete newImages[color];
      setVariantImages(newImages);
    } else {
      setSelectedColors([...selectedColors, color]);
      setVariantImages(prev => ({ ...prev, [color]: { main: null, hover: null, mainPreview: null, hoverPreview: null } }));
    }
  };

  const handleVariantImageSelect = (e: React.ChangeEvent<HTMLInputElement>, color: string, type: 'main' | 'hover') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setVariantImages(prev => ({
        ...prev,
        [color]: { ...prev[color], [type]: file, [type === 'main' ? 'mainPreview' : 'hoverPreview']: previewUrl }
      }));
    }
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('products').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedColors.length === 0) return alert("Please select at least one color!");
    
    for (const color of selectedColors) {
        if (!variantImages[color]?.main) return alert(`Please select main image for ${color} color!`);
    }

    setLoading(true);
    try {
      const variantsData = [];
      for (const color of selectedColors) {
         const mainUrl = await uploadFile(variantImages[color].main!);
         const hoverUrl = variantImages[color].hover ? await uploadFile(variantImages[color].hover!) : null;
         variantsData.push({ color: color, mainImage: mainUrl, hoverImage: hoverUrl });
      }
      
      const primaryVariant = variantsData[0];

      const { error } = await supabase.from('products').insert([{
          name: formData.name, 
          price: Number(formData.price), 
          category: formData.category,
          material: formData.material, 
          sizes: formData.category === 'Ring' ? formData.sizes : null,
          colors: selectedColors.join(','), 
          stock: 1000, 
          image_url: primaryVariant.mainImage,
          image2: primaryVariant.hoverImage,
          variants: variantsData
      }]);
      
      if (error) throw error;
      alert('Product Added Successfully! 🎉');
      
      setFormData({ name: '', price: '', category: 'Necklace', material: 'stainless steel', sizes: '' });
      setSelectedColors([]);
      setVariantImages({});
      
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 border-b pb-4 text-[#355E61] font-serif">Add Product (Multi-Color)</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Category</label>
            <select className="w-full p-3 border rounded-lg bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option>Necklace</option><option>Bangle</option><option>Ring</option><option>Earring</option><option>Bracelet</option><option>Handchain</option><option>Cuff</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Material</label>
            <select className="w-full p-3 border rounded-lg bg-white" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})}>
              <option value="stainless steel">Stainless Steel</option><option value="gold plated">Gold Plated</option>
            </select>
          </div>
        </div>

        <input required placeholder="Product Name" className="w-full p-3 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required type="number" placeholder="Price (EGP)" className="w-full p-3 border rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />

        {formData.category === 'Ring' && (
          <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-[#355E61]/20">
            <label className="block text-sm font-bold mb-2">Sizes (e.g. 6, 7, 8)</label>
            <input placeholder="Example: 6, 7, 8" className="w-full p-3 border rounded-lg bg-white" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
          </div>
        )}

        {/* --- تعديل: اختيار الألوان بشكل أوتوماتيك --- */}
        <div className="bg-gray-50 p-6 rounded-lg border border-[#355E61]/20">
            <label className="block text-lg font-bold mb-4 text-[#355E61] font-serif">1. Select Available Colors</label>
            <div className="flex flex-wrap gap-4 mb-6">
                {AVAILABLE_COLORS.map((col) => (
                  <label key={col.name} className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition p-3 bg-white rounded-lg border shadow-sm ${selectedColors.includes(col.name) ? 'border-[#355E61] ring-1 ring-[#355E61]' : 'border-gray-200'}`}>
                      <input type="checkbox" checked={selectedColors.includes(col.name)} onChange={() => toggleColor(col.name)} className={`w-5 h-5 accent-[#355E61]`} />
                      <span className={`font-bold ${col.style}`}>{col.name}</span>
                  </label>
                ))}
            </div>

            {selectedColors.length > 0 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                    <div className="h-px bg-gray-200 w-full mb-4"></div>
                    <label className="block text-lg font-bold mb-2 text-[#355E61] font-serif">2. Upload Images for each Color</label>
                    
                    {selectedColors.map(color => (
                        <div key={color} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold mb-3 uppercase tracking-widest text-gray-700">{color} Version</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-32 border-2 border-dashed rounded-lg relative flex items-center justify-center overflow-hidden hover:border-[#355E61] bg-gray-50 cursor-pointer group">
                                    {variantImages[color]?.mainPreview ? <img src={variantImages[color].mainPreview!} className="w-full h-full object-cover"/> : <div className="text-center opacity-40"><Upload className="mx-auto w-6 h-6 mb-1"/> <span className="text-[10px] font-bold uppercase block">Main ({color})</span></div>}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleVariantImageSelect(e, color, 'main')}/>
                                </div>
                                <div className="h-32 border-2 border-dashed rounded-lg relative flex items-center justify-center overflow-hidden hover:border-[#355E61] bg-gray-50 cursor-pointer group">
                                    {variantImages[color]?.hoverPreview ? <img src={variantImages[color].hoverPreview!} className="w-full h-full object-cover"/> : <div className="text-center opacity-40"><Upload className="mx-auto w-6 h-6 mb-1"/> <span className="text-[10px] font-bold uppercase block">Hover ({color})</span></div>}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleVariantImageSelect(e, color, 'hover')}/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#355E61] text-white py-4 rounded-xl font-bold hover:bg-[#2F4F4F] transition-all flex items-center justify-center gap-2 shadow-lg">
          {loading ? <Loader className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5"/> Upload Product</>}
        </button>
      </form>
    </div>
  );
}