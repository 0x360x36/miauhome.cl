"use client"

import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { Plus, Tag, Calendar, CheckCircle2, XCircle } from 'lucide-react';

interface Discount {
  id: number;
  code: string;
  percentage: number;
  valid_until: string;
  is_active: boolean;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Discount[]>([]);

  useEffect(() => {
    setCoupons([
      { id: 1, code: 'BIENVENIDO10', percentage: 10, valid_until: '2026-12-31', is_active: true },
      { id: 2, code: 'GATITO20', percentage: 20, valid_until: '2026-06-30', is_active: true },
      { id: 3, code: 'OFFER5', percentage: 5, valid_until: '2025-12-31', is_active: false },
    ]);
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Cupones y Descuentos</h2>
          <p className="text-gray-600">Crea y gestiona promociones para tus clientes.</p>
        </div>
        <button className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors">
          <Plus size={20} />
          <span>Nuevo Cupón</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-bold uppercase ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {coupon.is_active ? 'Activo' : 'Inactivo'}
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-pink-100 p-3 rounded-xl text-pink-600">
                <Tag size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-wider">{coupon.code}</h3>
                <p className="text-pink-600 font-bold">{coupon.percentage}% de descuento</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>Válido hasta: {new Date(coupon.valid_until).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {coupon.is_active ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                <span>{coupon.is_active ? 'Estado: Canjeable' : 'Estado: Expirado o desactivado'}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors">
                Editar
              </button>
              <button className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${coupon.is_active ? 'text-red-600 border border-red-100 hover:bg-red-50' : 'text-green-600 border border-green-100 hover:bg-green-50'}`}>
                {coupon.is_active ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
