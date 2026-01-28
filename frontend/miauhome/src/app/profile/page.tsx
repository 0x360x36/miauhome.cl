"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, User, MapPin, CreditCard, ShoppingBag, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Resumen de Cuenta</h1>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl">
                    <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-2xl font-black text-gray-900">{user.orders?.length || 0}</p>
                    <p className="text-sm text-gray-500 font-medium">Pedidos realizados</p>
                </div>

                <div className="bg-secondary/5 border border-secondary/10 p-6 rounded-2xl">
                    <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                        <CreditCard className="h-5 w-5 text-secondary" />
                    </div>
                    <p className="text-2xl font-black text-gray-900">{user.payment_methods?.length || 0}</p>
                    <p className="text-sm text-gray-500 font-medium">Tarjetas guardadas</p>
                </div>

                <div className="bg-accent/5 border border-accent/10 p-6 rounded-2xl">
                    <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                        <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <p className="text-2xl font-black text-gray-900">{user.addresses?.length || 0}</p>
                    <p className="text-sm text-gray-500 font-medium">Direcciones</p>
                </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-6">Detalles Personales</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Nombre Completo</p>
                            <p className="font-bold text-gray-900">{user.first_name} {user.last_name}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Correo Electrónico</p>
                            <p className="font-bold text-gray-900">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-400 uppercase font-bold">Dirección Principal</p>
                            <p className="font-bold text-gray-900">
                                {user.addresses?.[0]?.address_line || 'Sin dirección registrada'}
                            </p>
                            {user.addresses?.[0] && (
                                <p className="text-xs text-gray-500 font-medium">
                                    {user.addresses[0].city}, {user.addresses[0].region}
                                </p>
                            )}
                        </div>
                        <Link href="/profile/settings" className="text-primary hover:bg-primary/10 p-1 rounded-full">
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
