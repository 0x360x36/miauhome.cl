"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';

export default function CheckoutResultPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [details, setDetails] = useState<any>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const token_ws = searchParams.get('token_ws');
        if (token_ws) {
            axios.get(`${API_URL}/checkout/confirm`, {
                params: { token_ws }
            }).then(res => {
                if (res.data.status === 'AUTHORIZED') {
                    setStatus('success');
                    setDetails(res.data);
                    clearCart();
                } else {
                    setStatus('failed');
                }
            }).catch(err => {
                console.error("Confirmation error", err);
                setStatus('failed');
            });
        } else {
            // If no token, maybe it was cancelled or redirected wrongly
            setStatus('failed');
        }
    }, [searchParams]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-gray-700">Confirmando tu pago...</h2>
                <p className="text-gray-500">Por favor, no cierres esta ventana.</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-20 px-4 text-center">
            {status === 'success' ? (
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-green-50">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
                    <p className="text-gray-600 mb-8">
                        Tu pedido ha sido procesado correctamente. Recibirás un correo con el detalle.
                    </p>
                    <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Orden:</span>
                            <span className="font-bold text-gray-900">{details?.buy_order}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Monto:</span>
                            <span className="font-bold text-gray-900">${details?.amount?.toLocaleString('es-CL')}</span>
                        </div>
                    </div>
                    <Button className="w-full py-6 rounded-xl" onClick={() => router.push('/profile/orders')}>
                        Ver mis Pedidos
                    </Button>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-50">
                    <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Pago Fallido</h1>
                    <p className="text-gray-600 mb-8">
                        Lo sentimos, no pudimos procesar tu pago. Por favor intenta nuevamente.
                    </p>
                    <Button className="w-full py-6 rounded-xl" variant="outline" onClick={() => router.push('/checkout')}>
                        Reintentar Pago
                    </Button>
                </div>
            )}
            
            <Button variant="ghost" className="mt-8 text-gray-500 flex items-center gap-2 mx-auto" onClick={() => router.push('/')}>
                <ShoppingBag className="h-4 w-4" /> Volver a la Tienda
            </Button>
        </div>
    );
}
