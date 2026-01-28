"use client"

import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  current_stock: number;
  min_stock: number;
  last_restock: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    setItems([
      { id: 1, name: 'Alimento Premium 10kg', sku: 'AL-PR-10', current_stock: 5, min_stock: 10, last_restock: '2025-01-15' },
      { id: 2, name: 'Rascador Gato', sku: 'MU-RA-01', current_stock: 12, min_stock: 5, last_restock: '2025-01-10' },
      { id: 3, name: 'Arena 5L', sku: 'HI-AR-05', current_stock: 3, min_stock: 20, last_restock: '2025-01-05' },
      { id: 4, name: 'Juguete Ratón', sku: 'JU-RA-01', current_stock: 50, min_stock: 15, last_restock: '2025-01-20' },
    ]);
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Inventario</h2>
          <p className="text-gray-600">Controla el stock y las reposiciones.</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          <RefreshCcw size={20} />
          <span>Actualizar Stock</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Bajo Stock</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-bold text-red-600">8</p>
            <AlertTriangle className="text-red-500 mb-1" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Entradas este mes</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-bold text-blue-600">145</p>
            <ArrowUpRight className="text-blue-500 mb-1" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Salidas este mes</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-bold text-orange-600">230</p>
            <ArrowDownRight className="text-orange-500 mb-1" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-500">
              <th className="px-6 py-4 font-medium">Producto</th>
              <th className="px-6 py-4 font-medium text-center">SKU</th>
              <th className="px-6 py-4 font-medium text-center">Stock Actual</th>
              <th className="px-6 py-4 font-medium text-center">Mínimo</th>
              <th className="px-6 py-4 font-medium text-center">Estado</th>
              <th className="px-6 py-4 font-medium text-right">Última Reposición</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {items.map((item) => {
              const isLow = item.current_stock <= item.min_stock;
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-center font-mono text-gray-500">{item.sku}</td>
                  <td className="px-6 py-4 text-center font-bold">{item.current_stock}</td>
                  <td className="px-6 py-4 text-center text-gray-500">{item.min_stock}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {isLow ? 'REPONER' : 'OK'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">{item.last_restock}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
