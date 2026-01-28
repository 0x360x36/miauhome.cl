"use client"

import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { Search, Eye, Download, Filter, Loader2, X, CreditCard, Calendar, Mail, Package } from 'lucide-react';
import api from '@/lib/api';

interface Order {
  id: number;
  guest_email?: string;
  guest_address?: string;
  user_name?: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_type: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const exportCSV = () => {
    const headers = ['ID', 'Cliente', 'Fecha', 'Estado', 'Pago', 'Total'];
    const csvData = orders.map(o => [
      o.id,
      o.guest_email || 'Usuario',
      new Date(o.created_at).toLocaleString(),
      o.status,
      o.payment_type,
      o.total_amount
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pedidos_miauhome_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: number, newStatus: string) => {
    try {
      setIsUpdating(true);
      // We need an endpoint for this in the backend
      await api.put(`/orders/${id}/status`, { status: newStatus });
      await fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder({...selectedOrder, status: newStatus});
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error al actualizar el estado");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(searchTerm) ||
    o.guest_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'PAGADO';
      case 'pending': return 'PENDIENTE';
      case 'failed': return 'FALLIDO';
      default: return status.toUpperCase();
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Pedidos</h2>
          <p className="text-gray-600">Monitorea y gestiona las ventas realizadas.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          <Download size={20} />
          <span>Exportar CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por ID o email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={18} />
            <span>Filtros</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">ID Pedido</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium text-center">Estado</th>
                <th className="px-6 py-4 font-medium text-center">Pago</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No se han encontrado pedidos.
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 font-medium">{order.guest_email || 'Usuario Registrado'}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">{order.payment_type}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">${order.total_amount.toLocaleString('es-CL')}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Detalle del Pedido #{selectedOrder.id}</h3>
                <p className="text-sm text-gray-500">Realizado el {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Mail size={20} /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Cliente</p>
                      <p className="font-medium text-gray-900">{selectedOrder.guest_email || 'Usuario Registrado'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><Package size={20} /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Dirección</p>
                      <p className="font-medium text-gray-900">{selectedOrder.guest_address || 'Retiro en Tienda / No especificado'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-50 p-2 rounded-lg text-green-600"><CreditCard size={20} /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Método de Pago</p>
                      <p className="font-medium text-gray-900">{selectedOrder.payment_type.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Calendar size={20} /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Total</p>
                      <p className="text-xl font-bold text-gray-900">${selectedOrder.total_amount.toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4">Gestión de Estado</h4>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'paid', 'shipped', 'delivered', 'failed'].map((s) => (
                    <button
                      key={s}
                      disabled={isUpdating}
                      onClick={() => updateOrderStatus(selectedOrder.id, s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedOrder.status === s 
                          ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 scale-105' 
                          : 'bg-white text-gray-500 border border-gray-200 hover:border-pink-200'
                      }`}
                    >
                      {getStatusText(s)}
                    </button>
                  ))}
                </div>
                {isUpdating && <p className="text-[10px] text-pink-500 mt-2 animate-pulse">Actualizando servidor...</p>}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex gap-4">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-white border border-gray-200 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
