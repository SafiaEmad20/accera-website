'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
// ضفنا RefreshCw هنا
import { ChevronDown, ChevronUp, Package, Phone, MapPin, CheckCircle, Clock, Truck, RefreshCw } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // 1. دالة سحب الأوردرات
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false }); // الأحدث فوق

    if (error) console.error('Error:', error);
    else setOrders(data || []);
    
    // Timeout صغير عشان تلحقي تشوفي اللفة 😉
    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. دالة تحديث الحالة (New -> Shipped -> Delivered)
  const updateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      fetchOrders(); // تحديث الصفحة
    } else {
      alert("Failed to update status");
    }
  };

  // 3. تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-EG', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* --- Header الصفحة الجديد (الأيقونة اللي بتلف) --- */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#355E61] flex items-center gap-2">
              <Package className="w-8 h-8"/> Orders Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1 ml-10">Manage and track customer orders</p>
          </div>
          
          <button 
            onClick={fetchOrders} 
            disabled={loading}
            className="p-3 bg-white text-[#355E61] rounded-full shadow-sm hover:shadow-md hover:bg-[#355E61] hover:text-white transition-all border border-gray-200 group cursor-pointer"
            title="Refresh Data"
          >
            {/* اللوجيك: لو بيحمل تلف، لو لأ وتعملي هوفر تلف نص لفة */}
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </div>

        {loading && orders.length === 0 ? (
          <div className="text-center py-20">
             <RefreshCw className="w-10 h-10 mx-auto text-gray-300 animate-spin mb-4"/>
             <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 opacity-60">
             <Package className="w-16 h-16 mx-auto mb-4 text-gray-300"/>
             <p className="text-xl font-serif text-gray-500">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                
                {/* --- Header بتاع الأوردر (يظهر من بره) --- */}
                <div 
                  className="p-6 flex flex-col md:flex-row justify-between items-center cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className={`p-3 rounded-full ${order.status === 'New' ? 'bg-blue-100 text-blue-600' : order.status === 'Shipped' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                        {order.status === 'New' ? <Clock className="w-6 h-6"/> : order.status === 'Shipped' ? <Truck className="w-6 h-6"/> : <CheckCircle className="w-6 h-6"/>}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)} • {order.customer_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-lg text-[#355E61]">{order.total_price} EGP</p>
                      <p className="text-xs text-gray-400">{order.items?.length || 0} items</p>
                    </div>
                    {expandedOrderId === order.id ? <ChevronUp className="text-gray-400"/> : <ChevronDown className="text-gray-400"/>}
                  </div>
                </div>

                {/* --- التفاصيل (تظهر لما تدوسي كليك) --- */}
                {expandedOrderId === order.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-6 animate-in slide-in-from-top-2">
                    <div className="grid md:grid-cols-2 gap-8">
                      
                      {/* 1. بيانات العميل */}
                      <div>
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4"/> Shipping Details</h4>
                        <div className="bg-white p-4 rounded border text-sm space-y-2 text-gray-600">
                          <p><strong className="text-gray-900">Name:</strong> {order.customer_name}</p>
                          <p><strong className="text-gray-900">Phone:</strong> {order.phone} {order.phone2 ? `/ ${order.phone2}` : ''}</p>
                          <p><strong className="text-gray-900">Gov:</strong> {order.governorate}</p>
                          <p><strong className="text-gray-900">Address:</strong> {order.address}</p>
                        </div>
                        
                        <div className="mt-4">
                            <h4 className="font-bold text-gray-700 mb-2">Change Status:</h4>
                            <div className="flex gap-2">
                                <button onClick={() => updateStatus(order.id, 'New')} className={`px-3 py-1 text-xs rounded border cursor-pointer ${order.status === 'New' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}>New</button>
                                <button onClick={() => updateStatus(order.id, 'Shipped')} className={`px-3 py-1 text-xs rounded border cursor-pointer ${order.status === 'Shipped' ? 'bg-yellow-500 text-white' : 'bg-white hover:bg-gray-100'}`}>Shipped</button>
                                <button onClick={() => updateStatus(order.id, 'Delivered')} className={`px-3 py-1 text-xs rounded border cursor-pointer ${order.status === 'Delivered' ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-100'}`}>Delivered</button>
                            </div>
                        </div>
                      </div>

                      {/* 2. المنتجات المطلوبة */}
                      <div>
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Package className="w-4 h-4"/> Order Items</h4>
                        <div className="bg-white border rounded overflow-hidden">
                          {order.items && order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 p-3 border-b last:border-0">
                              <img src={item.mainImage} className="w-12 h-16 object-cover rounded bg-gray-100"/>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                {item.selectedSize && <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Size: {item.selectedSize}</span>}
                                <p className="text-xs text-[#D4AF37] font-bold mt-1">{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}