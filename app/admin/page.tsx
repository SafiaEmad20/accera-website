'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, Loader, Plus } from 'lucide-react';


export default function AdminPage() {
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'Necklace', material: 'stainless steel', sizes: '', 
  });
  const [imageFile1, setImageFile1] = useState<File | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      if (isMain) { setImageFile1(file); setPreview1(previewUrl); } 
      else { setImageFile2(file); setPreview2(previewUrl); }
    }
  };

  const uploadSingleImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('products').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile1) return alert("Select Main Image!");
    setLoading(true);
    try {
      const url1 = await uploadSingleImage(imageFile1);
      const url2 = imageFile2 ? await uploadSingleImage(imageFile2) : null;
      
      const { error } = await supabase.from('products').insert([{
          name: formData.name, price: Number(formData.price), category: formData.category,
          material: formData.material, sizes: formData.category === 'Ring' ? formData.sizes : null,
          image_url: url1, image2: url2
      }]);
      
      if (error) throw error;
      alert('Added! 🎉');
      setFormData({ name: '', price: '', category: 'Necklace', material: 'stainless steel', sizes: '' });
      setPreview1(null); setPreview2(null); setImageFile1(null); setImageFile2(null);
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 border-b pb-4 text-[#355E61] font-serif">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Category</label>
            <select className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#355E61]/20 bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option>Necklace</option><option>Bangle</option><option>Ring</option><option>Earring</option><option>Bracelet</option><option>Handchain</option><option>Cuff</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Material</label>
            <select className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#355E61]/20 bg-white" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})}>
              <option value="stainless steel">Stainless Steel</option><option value="gold plated">Gold Plated</option>
            </select>
          </div>
        </div>

        <input required placeholder="Product Name" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#355E61]/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required type="number" placeholder="Price (EGP)" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#355E61]/20" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />

        {formData.category === 'Ring' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-50 p-4 rounded-lg border border-dashed border-[#355E61]/20">
            <label className="block text-sm font-bold mb-2">Sizes (Separate with commas)</label>
            <input placeholder="Example: 6, 7, 8" className="w-full p-3 border border-[#355E61]/30 rounded-lg outline-none focus:ring-2 focus:ring-[#355E61] bg-white" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 border-2 border-dashed rounded-xl relative flex items-center justify-center overflow-hidden hover:border-[#355E61] transition-colors bg-gray-50 cursor-pointer group">
              {preview1 ? <img src={preview1} className="w-full h-full object-cover"/> : <div className="text-center opacity-40 group-hover:opacity-60 transition"><Upload className="mx-auto w-8 h-8 mb-2"/> <span className="text-xs font-bold uppercase block">Main Image</span></div>}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleImageSelect(e, true)}/>
          </div>
          <div className="h-40 border-2 border-dashed rounded-xl relative flex items-center justify-center overflow-hidden hover:border-[#355E61] transition-colors bg-gray-50 cursor-pointer group">
              {preview2 ? <img src={preview2} className="w-full h-full object-cover"/> : <div className="text-center opacity-40 group-hover:opacity-60 transition"><Upload className="mx-auto w-8 h-8 mb-2"/> <span className="text-xs font-bold uppercase block">Hover Image</span></div>}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleImageSelect(e, false)}/>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#355E61] text-white py-4 rounded-xl font-bold hover:bg-[#2F4F4F] transition-all flex items-center justify-center gap-2 shadow-lg">
          {loading ? <Loader className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5"/> Upload Product</>}
        </button>
      </form>
    </div>
  );
}