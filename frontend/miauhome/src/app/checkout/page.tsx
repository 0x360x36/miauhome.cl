"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { CreditCard, ShieldCheck, ShoppingBag, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PaymentMethod {
    id: number;
    card_type: string;
    last_four: string;
    is_default: boolean;
}

export default function CheckoutPage() {
    const { cart, total, clearCart } = useCart();
    const { token, user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [guestEmail, setGuestEmail] = useState('');
    const [guestAddress, setGuestAddress] = useState('');
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const handleCheckout = async () => {
        if (!token && (!guestEmail || !guestAddress)) {
            alert("Por favor ingresa tu correo y dirección para continuar como invitado.");
            return;
        }

        setIsProcessing(true);
        try {
            const res = await axios.post(`${API_URL}/checkout`, {
                total_amount: total,
                guest_email: token ? null : guestEmail,
                guest_address: token ? null : guestAddress
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (res.data.url && res.data.token) {
                // Webpay Plus redirect
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = res.data.url;
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'token_ws';
                input.value = res.data.token;
                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
            } else {
                alert("Hubo un problema con el pago.");
            }
        } catch (err) {
            console.error("Checkout error", err);
            alert("Error al procesar el checkout");
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold">Tu carrito está vacío</h2>
                <Button className="mt-4" onClick={() => router.push('/')}>Volver a la tienda</Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Guest Information Form */}
                    {!token && (
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Información de Contacto</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                    <input 
                                        type="email" 
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="tu@email.com"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Envío</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Calle, Número, Depto, Comuna"
                                        value={guestAddress}
                                        onChange={(e) => setGuestAddress(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resumen del Carrito */}
                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" /> Resumen de Compra
                        </h2>
                        <div className="divide-y">
                            {cart.map((item, idx) => {
                                const price = item.variation?.price || item.product.price;
                                return (
                                    <div key={idx} className="py-4 flex justify-between">
                                        <div>
                                            <p className="font-bold">{item.product.name}</p>
                                            {item.variation && (
                                                <p className="text-xs text-secondary font-medium">Opción: {item.variation.name}</p>
                                            )}
                                            <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold">${(price * item.quantity).toLocaleString('es-CL')}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" /> Pago Seguro
                        </h2>
                        <p className="text-gray-600 mb-4">Serás redirigido a Webpay Plus para completar tu pago de forma segura.</p>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border">
                            <CreditCard className="h-8 w-8 text-gray-400" />
                            <div>
                                <p className="font-bold text-sm">Webpay Plus</p>
                                <p className="text-xs text-gray-500">Tarjeta de Crédito o Débito</p>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                        </div>
                    </div>
                </div>

                {/* Sidebar Total */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold mb-6">Total</h2>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${total.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Envío</span>
                                <span className="text-green-600 font-medium">Gratis</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span>${total.toLocaleString('es-CL')}</span>
                            </div>
                        </div>

                        <Button 
                            className="w-full py-6 text-lg rounded-xl flex items-center justify-center gap-2"
                            onClick={handleCheckout}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Procesando..." : "Pagar Ahora"}
                            {!isProcessing && <ChevronRight className="h-5 w-5" />}
                        </Button>

                        <p className="text-[10px] text-gray-400 text-center mt-4">
                            Al pagar aceptas los términos y condiciones de MiauHome.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
