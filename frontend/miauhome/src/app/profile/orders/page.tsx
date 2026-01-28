"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingBag, Package, Calendar, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Order {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    buy_order: string;
}

export default function OrdersPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('http://localhost:8000/users/me/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch (err) {
                console.error("Error fetching orders", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchOrders();
    }, [token]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'failed': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 w-full bg-gray-100 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="h-10 w-10 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Aún no has realizado ningún pedido</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div 
                            key={order.id}
                            className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="bg-primary/10 p-3 rounded-xl">
                                    <Package className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">
                                        ${order.total_amount.toLocaleString('es-CL')}
                                    </p>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(order.created_at)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            #{order.buy_order.slice(0, 8)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold border",
                                    getStatusColor(order.status)
                                )}>
                                    {order.status === 'paid' ? 'Pagado' : 
                                     order.status === 'pending' ? 'Pendiente' : 'Fallido'}
                                </span>
                                <button className="text-primary p-2 rounded-full hover:bg-primary/10 transition-colors">
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
