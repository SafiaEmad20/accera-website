'use client';

import React, { useState, useEffect } from 'react';
import { Menu, ShoppingBag, X, ArrowLeft, Trash2, Check, Truck, Lock, ChevronLeft, ChevronRight, Instagram, Phone } from 'lucide-react';
import { supabase } from './lib/supabase';
import Link from 'next/link'; // السر هنا لربط الصفحات

const SHIPPING_RATES: { [key: string]: number } = {
  "Cairo": 95, "Giza": 95, "Alexandria": 100, "Behira": 100, "Delta & Canal": 110,
  "Near Upper ": 125, "Far Upper & Matrouh": 140, "North Coast": 145, "Sini & New Valley": 160, 
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeView, setActiveView] = useState('home'); 
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('id', { ascending: false }); 
      if (data) {
        const formattedData = data.map(item => ({
          ...item,
          price: typeof item.price === 'number' ? `${item.price} EGP` : item.price,
          mainImage: item.image_url.startsWith('http') ? item.image_url : '/' + item.image_url,
          hoverImage: item.image2 ? (item.image2.startsWith('http') ? item.image2 : '/' + item.image2) : null,
          sizes: item.sizes ? item.sizes.split(',').map((s: string) => s.trim()) : []
        }));
        setProducts(formattedData);
      }
    };
    fetchProducts();
  }, []);

  const latestDrops = products.slice(0, 4); 

  const [checkoutForm, setCheckoutForm] = useState({ 
    firstName: '', secondName: '', fullAddress: '', 
    buildingNumber: '', floorNumber: '', apartmentNumber: '', 
    city: '', governorate: 'Cairo', phone: '', phone2: '' 
  });

  const addToCart = (product: any) => { setCart([...cart, product]); setIsCartOpen(true); };
  const removeFromCart = (indexToRemove: number) => { setCart(cart.filter((_, index) => index !== indexToRemove)); };
  const openProductPage = (product: any) => { setSelectedProduct(product); setActiveView('product_details'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const calculateTotal = () => {
    const subtotal = cart.reduce((t, i) => t + (parseInt(i.price.replace(" EGP", "")) || 0), 0);
    return subtotal + (SHIPPING_RATES[checkoutForm.governorate] || 95);
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullAddressString = `Add: ${checkoutForm.fullAddress}, Bldg: ${checkoutForm.buildingNumber}, Floor: ${checkoutForm.floorNumber}, Apt: ${checkoutForm.apartmentNumber}`;
    const { error } = await supabase.from('orders').insert([{
      customer_name: `${checkoutForm.firstName} ${checkoutForm.secondName}`,
      phone: checkoutForm.phone, phone2: checkoutForm.phone2,
      address: fullAddressString, governorate: checkoutForm.governorate,
      delivery_fee: SHIPPING_RATES[checkoutForm.governorate] || 95,
      items: cart, total_price: calculateTotal()
    }]);
    if (!error) { alert(`Order Placed Successfully! 🎉`); setCart([]); setIsCheckoutOpen(false); }
  };

  return (
    <div className="min-h-screen bg-[#355E61] text-[#F2EFE4] font-sans relative">
      <nav className="flex justify-between items-center p-6 border-b border-[#F2EFE4]/20 sticky top-0 bg-[#355E61] z-50 shadow-md">
        <button onClick={() => setIsMenuOpen(true)} className="p-1 hover:bg-white/10 rounded-md cursor-pointer"><Menu className="w-7 h-7" /></button>
        <div onClick={() => setActiveView('home')} className="text-2xl font-serif tracking-widest uppercase font-bold absolute left-1/2 -translate-x-1/2 cursor-pointer hover:opacity-80 transition-opacity">Accera</div>
        <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
          <ShoppingBag className="w-6 h-6 hover:text-[#F2EFE4]" />
          {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-[#F2EFE4] text-[#355E61] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{cart.length}</span>}
        </div>
      </nav>

      {/* Menu Sidebar */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/60 z-[60]" onClick={() => setIsMenuOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#2F4F4F] z-[70] transition-transform duration-300 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between p-6 border-b border-white/10"><span className="text-xl font-serif">MENU</span><button onClick={() => setIsMenuOpen(false)} className="cursor-pointer"><X className="w-8 h-8" /></button></div>
        <div className="p-8 flex flex-col">
            <button onClick={() => {setActiveView('home'); setIsMenuOpen(false);}} className="w-full text-left text-xl font-serif py-3 border-b border-white/10 cursor-pointer">Home</button>
            {/* استخدام Link للذهاب لصفحة الـ Shop الجديدة */}
            <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="w-full text-left text-xl font-serif py-3 border-b border-white/20 mb-4 cursor-pointer">Shop All</Link>
        </div>
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && <div className="fixed inset-0 bg-black/60 z-[80]" onClick={() => setIsCartOpen(false)} />}
      <div className={`fixed top-0 right-0 h-full w-[90%] max-w-sm bg-[#F2EFE4] text-[#355E61] z-[90] transition-transform duration-300 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between p-6 bg-white border-b"><span className="text-xl font-serif font-bold">CART ({cart.length})</span><button onClick={() => setIsCartOpen(false)} className="cursor-pointer"><X className="w-6 h-6" /></button></div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.map((item, index) => (
            <div key={index} className="flex gap-4 items-center bg-white p-3 rounded-lg shadow-sm">
              <img src={item.mainImage} className="w-16 h-20 object-cover rounded-sm" />
              <div className="flex-1"><h4 className="font-bold text-sm">{item.name}</h4><p className="font-bold text-sm opacity-70">{item.price}</p></div>
              <button onClick={() => removeFromCart(index)} className="text-red-400 cursor-pointer"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
        <div className="p-6 bg-white border-t"><button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} disabled={cart.length === 0} className="w-full py-4 bg-[#355E61] text-white font-bold uppercase disabled:bg-gray-300 cursor-pointer">CHECKOUT</button></div>
      </div>

      {/* Main Home View */}
      {activeView === 'home' && (
        <>
          <main className="container mx-auto px-6 py-10 text-center">
            <h1 className="text-5xl md:text-7xl font-serif mb-6 tracking-widest uppercase font-bold">Accera</h1>
            <p className="text-sm md:text-base font-light italic opacity-70 mb-8 tracking-wide max-w-sm mx-auto"> "Elevate your everyday elegance." </p>
            {/* السر هنا: استخدام Link بدل Button لصفحة الـ Shop */}
            <Link href="/shop" className="inline-block bg-[#F2EFE4] text-[#355E61] px-10 py-3 font-semibold hover:bg-white transition uppercase tracking-widest cursor-pointer shadow-lg">
              SHOP COLLECTION
            </Link>
          </main>
          
          <section className="container mx-auto px-6 py-4">
              <h2 className="text-3xl font-serif text-center mb-10">Latest Drops</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {latestDrops.map((item) => <SmallCard key={item.id} item={item} onClick={() => openProductPage(item)} onAdd={addToCart} />)}
              </div>
          </section>
        </>
      )}

      {/* Product View remains for now within Home context */}
      {activeView === 'product_details' && selectedProduct && <ProductDetailView product={selectedProduct} onBack={() => setActiveView('home')} onAdd={addToCart} />}

      {/* Checkout View */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-[#355E61] z-[100] overflow-y-auto text-[#F2EFE4]">
           <div className="max-w-4xl mx-auto p-8">
              <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-bold font-serif uppercase">Checkout</h2>
                  <button onClick={() => setIsCheckoutOpen(false)}><X className="w-6 h-6"/></button>
              </div>
              <form onSubmit={placeOrder} className="space-y-4 text-black">
                  <div className="grid grid-cols-2 gap-4">
                      <input required placeholder="First Name" className="p-3 rounded-md" value={checkoutForm.firstName} onChange={(e:any) => setCheckoutForm({...checkoutForm, firstName: e.target.value})} />
                      <input required placeholder="Second Name" className="p-3 rounded-md" value={checkoutForm.secondName} onChange={(e:any) => setCheckoutForm({...checkoutForm, secondName: e.target.value})} />
                  </div>
                  <input required placeholder="Phone" className="w-full p-3 rounded-md" value={checkoutForm.phone} onChange={(e:any) => setCheckoutForm({...checkoutForm, phone: e.target.value})} />
                  <input required placeholder="Full Address" className="w-full p-3 rounded-md" value={checkoutForm.fullAddress} onChange={(e:any) => setCheckoutForm({...checkoutForm, fullAddress: e.target.value})} />
                  <select className="w-full p-3 rounded-md" value={checkoutForm.governorate} onChange={(e) => setCheckoutForm({...checkoutForm, governorate: e.target.value})}>
                      {Object.keys(SHIPPING_RATES).map((gov) => <option key={gov} value={gov}>{gov}</option>)}
                  </select>
                  <button type="submit" className="w-full bg-[#F2EFE4] text-[#355E61] py-5 rounded-lg font-bold uppercase tracking-widest mt-4">Complete Order</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

// Reusable Components
function SmallCard({ item, onClick, onAdd }: any) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="group w-full relative" onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="aspect-[3/4] bg-white/5 relative overflow-hidden rounded-sm border border-white/10 cursor-pointer shadow-lg">
          <img src={item.mainImage} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered && item.hoverImage ? 'opacity-0' : 'opacity-100'}`} />
          {item.hoverImage && <img src={item.hoverImage} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />}
          <button onClick={(e) => { e.stopPropagation(); onAdd({...item}); }} className="absolute bottom-0 w-full bg-[#355E61] text-[#F2EFE4] text-xs font-bold uppercase py-3 translate-y-full group-hover:translate-y-0 transition duration-300 z-10 cursor-pointer">Quick Add</button>
      </div>
      <div className="mt-3 text-center">
          <h3 className="text-sm font-serif truncate uppercase tracking-widest opacity-80">{item.name}</h3>
          <span className="text-xs font-medium opacity-50">{item.price}</span>
      </div>
    </div>
  );
}

function ProductDetailView({ product, onBack, onAdd }: any) {
  const images = [product.mainImage, product.hoverImage].filter(img => img); 
  const [currentIndex, setCurrentIndex] = useState(0);
  return (
    <div className="container mx-auto px-6 py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-white/70 mb-8 font-bold"><ArrowLeft className="w-5 h-5"/> Back</button>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 aspect-square relative bg-white/5 rounded-lg overflow-hidden">
            <img src={images[currentIndex]} className="w-full h-full object-cover" />
        </div>
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-serif mb-4 uppercase font-bold">{product.name}</h1>
          <p className="text-2xl mb-8">{product.price}</p>
          <button onClick={() => onAdd(product)} className="w-full bg-[#F2EFE4] text-[#355E61] py-4 text-lg font-bold uppercase tracking-widest">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}