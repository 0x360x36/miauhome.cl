"use client"

import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { User, Mail, MapPin, ShoppingBag } from 'lucide-react';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  cat_name: string | null;
  orders_count: number;
  total_spent: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    setCustomers([
      { id: 1, first_name: 'Juan', last_name: 'Pérez', email: 'juan@example.com', cat_name: 'Michi', orders_count: 5, total_spent: 125000 },
      { id: 2, first_name: 'María', last_name: 'López', email: 'maria@example.com', cat_name: 'Luna', orders_count: 2, total_spent: 45000 },
      { id: 3, first_name: 'Carlos', last_name: 'Ruiz', email: 'carlos@example.com', cat_name: null, orders_count: 1, total_spent: 15000 },
    ]);
  }, []);

  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Clientes</h2>
        <p className="text-gray-600">Administra la base de datos de tus clientes y sus gatitos.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{customer.first_name} {customer.last_name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail size={12} />
                  {customer.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Mascota</p>
                <p className="font-medium text-gray-800">{customer.cat_name || 'No registrada'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Pedidos</p>
                <p className="font-medium text-gray-800">{customer.orders_count}</p>
              </div>
              <div className="col-span-2 pt-2">
                <p className="text-xs text-gray-500 uppercase font-medium">Total Gastado</p>
                <p className="text-xl font-bold text-pink-500">${customer.total_spent.toLocaleString('es-CL')}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors">
                Ver Perfil
              </button>
              <button className="flex-1 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors">
                Contactar
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
