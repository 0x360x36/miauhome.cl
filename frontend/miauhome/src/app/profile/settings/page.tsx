"use client";

import React, { useState } from 'react';
import { Bell, Lock, Globe, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Configuración</h1>

            <div className="space-y-8">
                {/* Notifications Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="h-5 w-5 text-gray-400" />
                        <h3 className="font-bold text-gray-900">Notificaciones</h3>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-900">Correos de promociones</p>
                            <p className="text-sm text-gray-500">Recibe ofertas exclusivas y novedades en tu email.</p>
                        </div>
                        <button 
                            onClick={() => setNotifications(!notifications)}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                                notifications ? "bg-primary" : "bg-gray-200"
                            )}
                        >
                            <span 
                                className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                    notifications ? "translate-x-6" : "translate-x-1"
                                )} 
                            />
                        </button>
                    </div>
                </section>

                {/* Security Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="h-5 w-5 text-gray-400" />
                        <h3 className="font-bold text-gray-900">Seguridad</h3>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                                <span className="font-medium text-gray-700">Cambiar Contraseña</span>
                            </div>
                            <Button variant="outline" size="sm">Actualizar</Button>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-blue-500" />
                                <span className="font-medium text-gray-700">Sesiones Activas</span>
                            </div>
                            <Button variant="outline" size="sm">Revisar</Button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
