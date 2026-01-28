'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';

interface SummaryStats {
  total_sales: number;
  order_count: number;
  product_count: number;
  user_count: number;
}

interface RecentOrder {
  id: number;
  guest_email?: string;
  total_amount: number;
  status: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [summaryRes, ordersRes] = await Promise.all([
          api.get('/stats/summary'),
          api.get('/orders?limit=5')
        ]);
        setStats(summaryRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (!user) return null;

  const statCards = [
    { name: 'Ventas Totales', value: `$${stats?.total_sales.toLocaleString('es-CL') || '0'}`, icon: DollarSign, color: 'bg-blue-500' },
    { name: 'Pedidos', value: stats?.order_count.toString() || '0', icon: ShoppingCart, color: 'bg-green-500' },
    { name: 'Productos', value: stats?.product_count.toString() || '0', icon: Package, color: 'bg-purple-500' },
    { name: 'Clientes', value: stats?.user_count.toString() || '0', icon: Users, color: 'bg-primary' },
  ];

  return (
    <>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Panel de Control</h2>
          <p className="text-gray-600">Hola {user.first_name}, gestiona tu tienda de gatitos.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase">{stat.name}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    <stat.icon size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <TrendingUp size={16} className="mr-1" />
                  <span>Dato real de la base de datos</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4">Pedidos Recientes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-sm text-gray-500">
                      <th className="pb-3 font-medium">ID Pedido</th>
                      <th className="pb-3 font-medium">Cliente</th>
                      <th className="pb-3 font-medium">Total</th>
                      <th className="pb-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {recentOrders.length === 0 ? (
                      <tr><td colSpan={4} className="py-4 text-center text-gray-400">No hay pedidos registrados</td></tr>
                    ) : recentOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-4">#ORD-{order.id}</td>
                        <td className="py-4 font-medium truncate max-w-[150px]">{order.guest_email || 'Usuario'}</td>
                        <td className="py-4">${order.total_amount.toLocaleString('es-CL')}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status === 'paid' ? 'Pagado' : order.status === 'pending' ? 'Pendiente' : 'Fallido'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4">Estado del Sistema</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div>
                      <p className="font-bold">API Conectada</p>
                      <p className="text-sm opacity-80">Sincronización en tiempo real activa</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800">
                  <div className="flex items-center gap-3">
                    <ShoppingCart size={20} />
                    <div>
                      <p className="font-bold">Webpay Plus</p>
                      <p className="text-sm opacity-80">Modo Integración habilitado</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
