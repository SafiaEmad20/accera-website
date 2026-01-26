'use client';

import React, { useState, useEffect } from 'react';
import { Menu, ShoppingBag, X, ArrowLeft, Trash2, Check, Truck, Lock, ChevronLeft, ChevronRight, Instagram, Phone } from 'lucide-react';
import { supabase } from './lib/supabase';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation';


const SHIPPING_RATES: { [key: string]: number } = {
  "Cairo": 95, "Giza": 95, "Alexandria": 100, "Behira": 100, "Delta & Canal": 110,
  "Near Upper ": 125, "Far Upper & Matrouh": 140, "North Coast": 145, "Sini & New Valley": 160, 
};

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeView, setActiveView] = useState('home'); 
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
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

  const categories = [...new Set(products.map(p => p.category))];
  const latestDrops = products.slice(0, 4); 

  const [checkoutForm, setCheckoutForm] = useState({ 
    firstName: '', secondName: '', fullAddress: '', 
    buildingNumber: '', floorNumber: '', apartmentNumber: '', 
    city: '', governorate: 'Cairo', phone: '', phone2: '' 
  });

  const addToCart = (product: any) => { setCart([...cart, product]); setIsCartOpen(true); };
  const removeFromCart = (indexToRemove: number) => { setCart(cart.filter((_, index) => index !== indexToRemove)); };
  const openProductPage = (product: any) => { setSelectedProduct(product); setActiveView('product_details'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  const openCategoryPage = (categoryName: string) => { 
    setSelectedCategoryName(categoryName); 
    setActiveView('category_view'); 
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((t, i) => t + (parseInt(i.price.replace(" EGP", "")) || 0), 0);
    return subtotal + (SHIPPING_RATES[checkoutForm.governorate] || 95);
  };

  // ------------------------------------------
  // 👇 دالة إرسال الإشعار لتليجرام (مضافة)
  // ------------------------------------------
  const sendTelegramNotification = async (orderData: any, items: any[]) => {
    const BOT_TOKEN = "8411605350:AAG6tRohwYth_XHqEKNbo6efiPEidua53zM"; 
    const CHAT_ID = "1135563408"; 

    const itemsList = items.map(i => `- ${i.name} (${i.selectedColor || 'No Color'})`).join('\n');
    
    const message = `
🚨 *New Order Received!* 💰
------------------------
👤 *Customer:* ${orderData.customer_name}
📱 *Phone:* ${orderData.phone}
📍 *Gov:* ${orderData.governorate}
------------------------
🛒 *Items:*
${itemsList}
------------------------
💵 *Total:* ${orderData.total_price} EGP
    `;

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
    } catch (error) {
      console.error("Telegram Error:", error);
    }
  };

  // ------------------------------------------
  // 👇 دالة تنفيذ الطلب (محدثة)
  // ------------------------------------------
  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullAddressString = `Add: ${checkoutForm.fullAddress}, Bldg: ${checkoutForm.buildingNumber}, Floor: ${checkoutForm.floorNumber}, Apt: ${checkoutForm.apartmentNumber}`;
    
    const orderData = {
      customer_name: `${checkoutForm.firstName} ${checkoutForm.secondName}`,
      phone: checkoutForm.phone, phone2: checkoutForm.phone2,
      address: fullAddressString, 
      governorate: checkoutForm.governorate,
      delivery_fee: SHIPPING_RATES[checkoutForm.governorate] || 95,
      items: cart, total_price: calculateTotal()
    };

    const { error } = await supabase.from('orders').insert([orderData]);

    if (!error) { 
       // نبعت الاشعار
       await sendTelegramNotification(orderData, cart);

       alert(`Order Placed Successfully! 🎉`); 
       setCart([]); 
       setIsCheckoutOpen(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#355E61] text-[#F2EFE4] font-sans relative">
      <nav className="flex justify-between items-center p-6 border-b border-[#F2EFE4]/20 sticky top-0 bg-[#355E61] z-50 shadow-md">
        <button onClick={() => setIsMenuOpen(true)} className="p-1 hover:bg-white/10 rounded-md cursor-pointer"><Menu className="w-7 h-7" /></button>
        <div onClick={() => setActiveView('home')} className="text-2xl font-serif tracking-widest uppercase font-bold absolute left-1/2 -translate-x-1/2 cursor-pointer">Accera</div>
        <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
          <ShoppingBag className="w-6 h-6" />
          {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-[#F2EFE4] text-[#355E61] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{cart.length}</span>}
        </div>
      </nav>

      {/* Menu Sidebar */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/60 z-[60]" onClick={() => setIsMenuOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#2F4F4F] z-[70] transition-transform duration-300 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between p-6 border-b border-white/10 shrink-0">
          <span className="text-xl font-serif text-[#F2EFE4]">MENU</span>
          <button onClick={() => setIsMenuOpen(false)} className="cursor-pointer text-[#F2EFE4]"><X className="w-8 h-8" /></button>
        </div>
        
        <div className="px-8 pt-2 flex flex-col flex-1 overflow-y-auto">
          <button onClick={() => { setActiveView('home'); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="w-full text-left text-xl font-serif py-4 border-b border-white/10 cursor-pointer text-[#F2EFE4]">Home</button>
          <button onClick={() => { setActiveView('shop'); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="w-full text-left text-xl font-serif py-4 border-b border-white/10 cursor-pointer text-[#F2EFE4]">Shop Collection</button>
          <div className="space-y-2">
            {['Ring', 'Earring', 'Bracelet', 'Necklace', 'Handchain', 'Cuff', 'Bangles'].map(cat => (
              <button key={cat} onClick={() => { openCategoryPage(cat); setIsMenuOpen(false); }} className="w-full text-left text-lg opacity-80 py-2 hover:text-[#D4AF37] transition cursor-pointer text-[#F2EFE4]">
                {cat === 'Bangles' ? cat : `${cat}s`}
              </button>
            ))}
          </div>
          <div className="mt-auto border-t border-white/10 pt-8 pb-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 opacity-40 text-[#F2EFE4]">Contact Us</h4>
              <div className="flex flex-col gap-6">
                <a href="https://www.instagram.com/accera.eg" target="_blank" rel="noreferrer" className="flex items-center gap-4 hover:opacity-100 opacity-80 transition cursor-pointer text-[#F2EFE4]">
                  <Instagram className="w-6 h-6" />
                  <span className="text-sm tracking-widest uppercase font-serif">Instagram</span>
                </a>
                <a href="https://wa.me/201124688327" target="_blank" rel="noreferrer" className="flex items-center gap-4 hover:opacity-100 opacity-80 transition cursor-pointer text-[#F2EFE4]">
                  <Phone className="w-6 h-6" />
                  <span className="text-sm tracking-widest uppercase font-serif">WhatsApp</span>
                </a>
              </div>
            </div>
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
              <div className="flex-1">
                <h4 className="font-bold text-sm">{item.name}</h4>
                {item.selectedSize && <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>}
                {item.selectedColor && <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>}
                <p className="font-bold text-sm opacity-70">{item.price}</p>
              </div>
              <button onClick={() => removeFromCart(index)} className="text-red-400 cursor-pointer"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
          {cart.length === 0 && <div className="text-center py-20 opacity-40 uppercase tracking-widest font-bold">Your cart is empty</div>}
        </div>
        <div className="p-6 bg-white border-t">
          <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} disabled={cart.length === 0} className="w-full py-4 bg-[#355E61] text-white font-bold uppercase disabled:bg-gray-300 cursor-pointer">CHECKOUT</button>
        </div>
      </div>

      {/* Checkout View */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-[#355E61] z-[100] overflow-y-auto text-[#F2EFE4] font-sans">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row min-h-screen">
            <div className="flex-1 p-8 md:p-12 border-r border-white/10">
              <div className="flex justify-between items-center mb-10">
                <h2 onClick={() => setIsCheckoutOpen(false)} className="text-3xl font-bold text-[#F2EFE4] font-serif uppercase tracking-tighter cursor-pointer">Accera</h2>
                <button onClick={() => setIsCheckoutOpen(false)} className="text-[#F2EFE4] cursor-pointer"><X className="w-6 h-6"/></button>
              </div>
              <form onSubmit={placeOrder} className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-widest border-white/20 border-b pb-2 mb-4 text-[#F2EFE4]">Delivery Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="First Name" className="w-full p-3 rounded-md bg-white text-black placeholder:text-gray-600 font-medium outline-none" value={checkoutForm.firstName} onChange={(e:any) => setCheckoutForm({...checkoutForm, firstName: e.target.value})} />
                  <input required placeholder="Second Name" className="w-full p-3 rounded-md bg-white text-black placeholder:text-gray-600 font-medium outline-none" value={checkoutForm.secondName} onChange={(e:any) => setCheckoutForm({...checkoutForm, secondName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Phone" className="w-full p-3 rounded-md bg-white text-black placeholder:text-gray-600 font-medium outline-none" value={checkoutForm.phone} onChange={(e:any) => setCheckoutForm({...checkoutForm, phone: e.target.value})} />
                  <input placeholder="Phone 2 (Optional)" className="w-full p-3 rounded-md bg-white text-black placeholder:text-gray-600 font-medium outline-none" value={checkoutForm.phone2} onChange={(e:any) => setCheckoutForm({...checkoutForm, phone2: e.target.value})} />
                </div>
                <input required placeholder="Full Address" className="w-full p-3 rounded-md bg-white text-black placeholder:text-gray-600 font-medium outline-none" value={checkoutForm.fullAddress} onChange={(e:any) => setCheckoutForm({...checkoutForm, fullAddress: e.target.value})} />
                <div className="grid grid-cols-3 gap-4">
                  <input required placeholder="Bldg #" className="w-full p-3 rounded-md bg-white text-black placeholder:text-gray-600 font-medium outline-none" value={checkoutForm.buildingNumber} onChange={(e:any) => setCheckoutForm({...checkoutForm, buildingNumber: e.target.value})} />
                  <input required placeholder="Floor" className="w-full p-3 rounded-md bg-white text-black placeholder:text-gray-600 font-medium outline-none" value={checkoutForm.floorNumber} onChange={(e:any) => setCheckoutForm({...checkoutForm, floorNumber: e.target.value})} />
                  <input required placeholder="Apt #" className="w-full p-3 rounded-md bg-white text-black placeholder:text-gray-600 font-medium outline-none" value={checkoutForm.apartmentNumber} onChange={(e:any) => setCheckoutForm({...checkoutForm, apartmentNumber: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="City" className="w-full p-3 rounded-md bg-white text-black placeholder:text-gray-600 font-medium outline-none" value={checkoutForm.city} onChange={(e:any) => setCheckoutForm({...checkoutForm, city: e.target.value})} />
                  <select className="w-full p-3 rounded-md bg-white text-black font-medium outline-none cursor-pointer" value={checkoutForm.governorate} onChange={(e) => setCheckoutForm({...checkoutForm, governorate: e.target.value})}>
                    {Object.keys(SHIPPING_RATES).map((gov) => <option key={gov} value={gov}>{gov}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-[#F2EFE4] text-[#355E61] py-5 rounded-lg font-bold uppercase tracking-widest hover:bg-white transition-all cursor-pointer mt-4">Complete Order</button>
              </form>
            </div>
            <div className="w-full md:w-[40%] bg-black/10 p-8 md:p-12">
              <h3 className="text-lg font-bold mb-8 opacity-50 uppercase tracking-widest text-[#F2EFE4]">Order Summary</h3>
              <div className="space-y-6">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between font-medium text-[#F2EFE4]">
                    <div>
                      <span>{item.name}</span>
                      {item.selectedColor && <span className="block text-xs opacity-60">Color: {item.selectedColor}</span>}
                    </div>
                    <span>{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 mt-8 pt-8 space-y-4">
                <div className="flex justify-between opacity-60 font-bold uppercase text-xs tracking-widest text-[#F2EFE4]"><span>Shipping</span><span>{SHIPPING_RATES[checkoutForm.governorate]} EGP</span></div>
                <div className="flex justify-between font-bold text-2xl text-white tracking-tight"><span>Total</span><span>{calculateTotal()} EGP</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Views */}
      {activeView === 'home' && (
        <>
          <main className="container mx-auto px-6 py-10 text-center">
            <h1 className="text-5xl md:text-7xl font-serif mb-6 tracking-widest uppercase font-bold text-[#F2EFE4]">Accera</h1>
            <p className="text-sm md:text-base font-light italic opacity-70 mb-8 tracking-wide max-w-sm mx-auto text-[#F2EFE4]"> "Elevate your everyday elegance" </p>
            <button onClick={() => setActiveView('shop')} className="inline-block bg-[#F2EFE4] text-[#355E61] px-10 py-3 font-semibold hover:bg-white transition uppercase tracking-widest cursor-pointer shadow-lg">
              SHOP COLLECTION
            </button>
          </main>
          <section className="container mx-auto px-6 py-4">
              <h2 className="text-3xl font-serif text-center mb-10 text-[#F2EFE4]">Latest Drops</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {latestDrops.map((item) => <SmallCard key={item.id} item={item} onClick={() => openProductPage(item)} onAdd={addToCart} />)}
              </div>
          </section>
        </>
      )}

      {activeView === 'shop' && (
        <div className="container mx-auto px-6 py-8">
           <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setActiveView('home')} className="p-2 hover:bg-white/10 rounded-full cursor-pointer text-[#F2EFE4]">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-serif border-l-4 border-white/20 pl-4 uppercase tracking-widest text-[#F2EFE4]">Shop All</h1>
           </div>
           <div className="space-y-12">
             {['Ring', 'Earring', 'Bracelet', 'Necklace', 'Handchain', 'Cuff', 'Bangles'].map((category) => {
               const categoryItems = products.filter(p => p.category === category);
               if (categoryItems.length === 0) return null;
               return (
                 <CategoryPreview 
                   key={category} 
                   title={category === 'Bangles' ? category : `${category}s`} 
                   items={categoryItems} 
                   onViewAll={() => openCategoryPage(category)} 
                   onProductClick={openProductPage} 
                   onAdd={addToCart} 
                 />
               );
             })}
           </div>
        </div>
      )}

      {activeView === 'category_view' && (
        <SectionView
          title={`${selectedCategoryName}s`}
          items={products.filter(p => p.category === selectedCategoryName)}
          onBack={() => setActiveView('shop')}
          onProductClick={openProductPage}
          onAdd={addToCart}
        />
      )}

      {activeView === 'product_details' && selectedProduct && (
        <ProductDetailView product={selectedProduct} onBack={() => setActiveView('home')} onAdd={addToCart} />
      )}
    </div>
  );
}

// Components
function CategoryPreview({ title, items, onViewAll, onProductClick, onAdd }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
        <h3 className="text-2xl font-serif pl-2 border-l-4 border-white/20 uppercase tracking-widest text-[#F2EFE4]">{title}</h3>
        <button onClick={onViewAll} className="text-xs text-white/50 font-bold uppercase hover:text-white transition cursor-pointer">View All</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.slice(0, 4).map((item: any) => <SmallCard key={item.id} item={item} onClick={() => onProductClick(item)} onAdd={onAdd} />)}
      </div>
    </div>
  );
}

function SectionView({ title, items, onBack, onProductClick, onAdd }: any) {
  return (
    <div className="container mx-auto px-6 py-12 min-h-[80vh]">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full cursor-pointer text-[#F2EFE4]"><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="text-3xl font-serif border-l-4 border-white/20 pl-4 uppercase tracking-widest text-[#F2EFE4]">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item: any) => <SmallCard key={item.id} item={item} onClick={() => onProductClick(item)} onAdd={onAdd} />)}
      </div>
    </div>
  );
}

function SmallCard({ item, onClick, onAdd }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const isOutOfStock = item.stock === 0;

  return (
    <div className="group w-full relative" onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="aspect-[3/4] bg-white/5 relative overflow-hidden rounded-sm border border-white/10 cursor-pointer shadow-lg">
          <img src={item.mainImage} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered && item.hoverImage ? 'opacity-0' : 'opacity-100'} ${isOutOfStock ? 'opacity-50 grayscale' : ''}`} />
          {item.hoverImage && !isOutOfStock && <img src={item.hoverImage} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />}
          
          {isOutOfStock ? (
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                <span className="text-white font-bold uppercase tracking-widest border border-white px-4 py-2">Sold Out</span>
             </div>
          ) : (
             <button onClick={(e) => { e.stopPropagation(); onAdd({...item, selectedSize: item.sizes?.[0] || null}); }} className="absolute bottom-0 w-full bg-[#355E61] text-[#F2EFE4] text-xs font-bold uppercase py-3 translate-y-full group-hover:translate-y-0 transition duration-300 z-10 cursor-pointer">Quick Add</button>
          )}
      </div>
      <div className="mt-3 text-center">
          <h3 className="text-sm font-serif truncate uppercase tracking-widest opacity-80 text-[#F2EFE4]">{item.name}</h3>
          <span className="text-xs font-medium opacity-50 text-[#F2EFE4]">{item.price}</span>
      </div>
    </div>
  );
}

// ============================================
// 👇 التعديلات الرئيسية هنا (ProductDetailView)
// ============================================
function ProductDetailView({ product, onBack, onAdd }: any) {
  // 1. بنشوف لو المنتج فيه Variants (نظام الصور الجديد)
  const hasVariants = product.variants && product.variants.length > 0;
  
  // 2. بنحدد اللون الافتراضي (أول لون في Variants أو أول لون في colors القديم)
  const defaultColor = hasVariants 
        ? product.variants[0].color 
        : (product.colors ? product.colors.split(',')[0] : null);

  const [selectedColor, setSelectedColor] = useState(defaultColor);
  
  // 3. بنحدد الصور اللي هتظهر
  // لو فيه Variants واللون المختار موجود -> هات صوره
  // لو مفيش -> هات الصور الأساسية بتاعة المنتج
  const currentVariant = hasVariants ? product.variants.find((v: any) => v.color === selectedColor) : null;
  const displayMainImage = currentVariant ? currentVariant.mainImage : product.mainImage;
  const displayHoverImage = currentVariant ? currentVariant.hoverImage : product.hoverImage;

  const images = [displayMainImage, displayHoverImage].filter(img => img); 
  const [currentIndex, setCurrentIndex] = useState(0);

  // لما اللون يتغير، ارجع للصورة الأولى
  useEffect(() => { setCurrentIndex(0); }, [selectedColor]);

  return (
    <div className="container mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-[#F2EFE4]/70 mb-8 font-bold hover:text-white transition cursor-pointer">
        <ArrowLeft className="w-5 h-5"/> Back
      </button>
      <div className="flex flex-col md:flex-row gap-8 md:gap-16">
        
        {/* معرض الصور */}
        <div className="w-full md:w-1/2 relative group">
          <div className="aspect-[3/4] bg-white/5 rounded-lg overflow-hidden border border-[#F2EFE4]/10 shadow-2xl relative select-none">
            <img src={images[currentIndex]} className="w-full h-full object-cover transition-all duration-500" />
            
            {images.length > 1 && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/50 transition-all z-20 cursor-pointer active:scale-95"><ChevronLeft className="w-6 h-6" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % images.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/50 transition-all z-20 cursor-pointer active:scale-95"><ChevronRight className="w-6 h-6" /></button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">{images.map((_, idx) => (<div key={idx} className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-1.5'}`} />))}</div>
                </>
            )}
          </div>
        </div>

        {/* تفاصيل المنتج */}
        <div className="w-full md:w-1/2 pt-4">
          <h1 className="text-3xl md:text-4xl font-serif mb-4 uppercase font-bold tracking-widest text-[#F2EFE4]">{product.name}</h1>
          <p className="text-2xl font-light mb-8 opacity-90 text-[#F2EFE4]">{product.price}</p>
          <div className="h-px w-full bg-white/20 mb-8"></div>
          
          {/* هنا بنبعت الـ State والـ Setter لتحت عشان يغيروا الصور فوق */}
          <ProductActionArea 
             product={product} 
             selectedColor={selectedColor}
             setSelectedColor={setSelectedColor}
             onAdd={(item: any) => {
                 // 4. أهم نقطة: بنبعت للسلة المنتج بالصورة اللي ظاهرة دلوقتي
                 onAdd({ ...item, mainImage: displayMainImage, selectedColor });
             }}
          />
          
          <div className="mt-8 space-y-4 text-sm opacity-80 border-t border-white/10 pt-8 text-[#F2EFE4]">
            <div className="flex items-center gap-3"><Truck className="w-5 h-5"/> Delivery from 5-7 days</div>
            <div className="flex items-center gap-3"><Check className="w-5 h-5"/> Material: {product.material || 'stainless steel'}</div>
            <div className="flex items-center gap-3"><Lock className="w-5 h-5"/> Cash on delivery only</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 👇 تعديل ProductActionArea عشان يقبل تغيير الألوان
// ============================================
function ProductActionArea({ product, onAdd, selectedColor, setSelectedColor }: any) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.length > 0 ? product.sizes[0] : null);
  const isOutOfStock = product.stock === 0;

  // بنجيب الألوان المتاحة (سواء من variants الجداد أو colors القديمة)
  const availableColors = product.variants && product.variants.length > 0 
      ? product.variants.map((v: any) => v.color) 
      : (product.colors ? product.colors.split(',') : []);

  return (
    <div className="space-y-6">
      
      {availableColors.length > 0 && (
        <div>
           <label className="block text-sm font-bold mb-3 uppercase tracking-wider opacity-60 text-[#F2EFE4]">Select Color</label>
           <div className="flex gap-4">
             {availableColors.map((color: string) => (
                <button 
                  key={color}
                  // لما يدوس، بيغير الـ State اللي في الـ Parent، فالصور فوق تتغير
                  onClick={() => !isOutOfStock && setSelectedColor && setSelectedColor(color)}
                  className={`
                    px-6 py-2 rounded-full border transition-all uppercase font-bold text-sm cursor-pointer
                    ${selectedColor === color 
                        ? (color === 'Gold' ? 'bg-[#D4AF37] text-white border-[#D4AF37]' : 'bg-gray-300 text-gray-800 border-gray-300') 
                        : 'border-white/30 text-[#F2EFE4] hover:border-white'
                    }
                  `}
                >
                  {color}
                </button>
             ))}
           </div>
        </div>
      )}

      {product.sizes?.length > 0 && (
        <div>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider opacity-60 text-[#F2EFE4]">Select Size</label>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size: string) => (
              <button key={size} onClick={() => !isOutOfStock && setSelectedSize(size)} className={`w-12 h-12 rounded-full border border-white/30 flex items-center justify-center transition-all cursor-pointer ${selectedSize === size ? 'bg-[#F2EFE4] text-[#355E61] font-bold border-[#F2EFE4]' : 'hover:border-white text-[#F2EFE4]'} ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}>{size}</button>
            ))}
          </div>
        </div>
      )}
      
      <button 
          onClick={() => !isOutOfStock && onAdd({ ...product, selectedSize, selectedColor })} 
          disabled={isOutOfStock}
          className={`w-full py-4 text-lg font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 ${isOutOfStock ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-70' : 'bg-[#F2EFE4] text-[#355E61] hover:bg-white cursor-pointer'}`}
      >
        {isOutOfStock ? 'Out of Stock' : <><ShoppingBag className="w-5 h-5"/> Add to Cart</>}
      </button>
    </div>
  );
}