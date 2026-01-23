'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, PlusCircle, LayoutDashboard, Lock, KeyRound, ChevronRight } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. فحص الدخول عند التحميل
  useEffect(() => {
    const isLogged = sessionStorage.getItem('admin_logged_in');
    if (isLogged === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // 2. دالة تسجيل الدخول
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const SECRET_PASS = "ACCERA_25safia"; // كلمة السر

    if (passwordInput === SECRET_PASS) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_logged_in', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('Wrong Password! 🚫');
    }
  };

  const isActive = (path: string) => pathname === path ? "bg-[#355E61] text-white shadow-md" : "text-gray-600 hover:bg-gray-100";

  // --- 🔒 حالة 1: شاشة القفل (التصميم القديم مع تعديل المسافة) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#355E61] flex flex-col justify-center items-center text-[#F2EFE4] p-4">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <h1 className="text-5xl font-serif font-bold tracking-widest mb-2">ACCERA</h1>
           <p className="text-sm opacity-70 tracking-[0.3em] uppercase">Admin Access Only</p>
        </div>
        
        <div className="bg-white text-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-sm animate-in zoom-in duration-300">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <Lock className="w-8 h-8 text-[#355E61]"/>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-600">Password</label>
              <div className="relative">
                {/* 👇 التعديل هنا: pl-12 وسعت المسافة عشان الكلام يبعد عن المفتاح */}
                <input 
  type="password" 
  autoFocus
  style={{ paddingLeft: '2rem' }} 
  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#355E61] outline-none transition"
  placeholder="Enter access code"
  value={passwordInput}
  onChange={(e) => setPasswordInput(e.target.value)}
/>
                <KeyRound className="w-5 h-5 text-gray-400 absolute left-3 top-3.5"/>
              </div>
            </div>
            
            {errorMsg && <p className="text-red-500 text-sm font-bold text-center">{errorMsg}</p>}

            <button type="submit" className="w-full bg-[#355E61] text-white py-3 rounded font-bold hover:bg-[#2F4F4F] transition flex justify-center items-center gap-2">
              Login <ChevronRight className="w-4 h-4"/>
            </button>
          </form>
          
          <div className="mt-6 text-center border-t border-gray-100 pt-4">
             <Link href="/" className="text-sm text-gray-400 hover:text-[#355E61]">Back to Website</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- 🔓 حالة 2: لوحة التحكم (لما يفتح) ---
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col min-h-screen">
        <div className="p-8 text-center border-b border-gray-100">
          <h2 className="text-3xl font-serif font-bold text-[#355E61] tracking-widest">ACCERA</h2>
          <span className="text-xs text-gray-400 font-medium tracking-[0.2em] uppercase block mt-1">Admin Panel</span>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          <Link href="/admin/orders">
            <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive('/admin/orders')}`}>
              <Package className="w-5 h-5" /> <span className="font-bold text-sm">Orders</span>
            </div>
          </Link>
          <Link href="/admin">
            <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive('/admin')}`}>
              <PlusCircle className="w-5 h-5" /> <span className="font-bold text-sm">Add Product</span>
            </div>
          </Link>
        </nav>
        <div className="p-6 border-t border-gray-100">
            <button 
              onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem('admin_logged_in'); }}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition px-3 w-full"
            >
                <Lock className="w-4 h-4"/> Logout
            </button>
        </div>
      </aside>
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">{children}</main>
    </div>
  );
}