'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, PlusCircle, Lock, KeyRound, ChevronRight, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // دي عشان الموبايل

  // 1. فحص الدخول
  useEffect(() => {
    const isLogged = sessionStorage.getItem('admin_logged_in');
    if (isLogged === 'true') setIsAuthenticated(true);
  }, []);

  // 2. تسجيل الدخول
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "ACCERA_25safia") {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_logged_in', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('Wrong Password! 🚫');
    }
  };

  const isActive = (path: string) => pathname === path ? "bg-white/10 font-bold" : "hover:bg-white/5 opacity-70 hover:opacity-100";

  // --- شاشة القفل ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#355E61] flex flex-col justify-center items-center text-[#F2EFE4] p-4">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <h1 className="text-5xl font-serif font-bold tracking-widest mb-2">ACCERA</h1>
           <p className="text-sm opacity-70 tracking-[0.3em] uppercase">Admin Access Only</p>
        </div>
        <div className="bg-white text-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-sm">
          <div className="flex justify-center mb-6"><div className="bg-gray-100 p-4 rounded-full"><Lock className="w-8 h-8 text-[#355E61]"/></div></div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-600">Password</label>
              <div className="relative">
                <input type="password" autoFocus className="w-full p-3 pl-10 border border-gray-300 rounded focus:ring-2 focus:ring-[#355E61] outline-none" placeholder="Enter access code" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                <KeyRound className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
              </div>
            </div>
            {errorMsg && <p className="text-red-500 text-sm font-bold text-center">{errorMsg}</p>}
            <button type="submit" className="w-full bg-[#355E61] text-white py-3 rounded font-bold hover:bg-[#2F4F4F] transition flex justify-center items-center gap-2">Login <ChevronRight className="w-4 h-4"/></button>
          </form>
          <div className="mt-6 text-center border-t border-gray-100 pt-4"><Link href="/" className="text-sm text-gray-400 hover:text-[#355E61]">Back to Website</Link></div>
        </div>
      </div>
    );
  }

  // --- لوحة التحكم (الجديدة بالأخضر) ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-[#355E61]">
      
      {/* هيدر الموبايل فقط */}
      <div className="md:hidden p-4 bg-white shadow-sm flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-xl font-bold font-serif uppercase tracking-widest">Accera Admin</h1>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-[#355E61] text-white rounded-lg"><Menu className="w-6 h-6" /></button>
      </div>

      {/* خلفية سوداء للموبايل */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* الشريط الجانبي (الأخضر) */}
      <aside className={`
          fixed md:sticky top-0 h-screen w-64 bg-[#355E61] text-white z-50 flex flex-col
          transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
         <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-serif font-bold tracking-widest uppercase">Accera</h2>
              <p className="text-[10px] opacity-60 tracking-[0.2em] uppercase">Control Panel</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/80"><X className="w-6 h-6"/></button>
         </div>
         
         <nav className="flex-1 p-4 space-y-2">
            <Link href="/admin">
                <div className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${isActive('/admin')}`}>
                   <PlusCircle className="w-5 h-5"/> Add Product
                </div>
            </Link>
            <Link href="/admin/orders">
                <div className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${isActive('/admin/orders')}`}>
                   <Package className="w-5 h-5"/> Orders
                </div>
            </Link>
         </nav>

         <div className="p-4 border-t border-white/10">
            <button onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem('admin_logged_in'); }} className="flex items-center gap-3 p-3 text-red-300 hover:text-red-100 hover:bg-red-500/10 rounded-lg w-full transition">
               <Lock className="w-5 h-5"/> Logout
            </button>
         </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-4 md:p-10 flex justify-center items-start overflow-y-auto">
        {children}
      </main>
    </div>
  );
}