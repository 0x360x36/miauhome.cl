"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Cat, Info, Award } from 'lucide-react';

export default function PetPage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Información de tu Gato</h1>
            
            <div className="max-w-md mx-auto">
                <div className="relative mb-8">
                    <div className="w-32 h-32 bg-secondary/10 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                        <Cat className="h-16 w-16 text-secondary" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <Info className="h-5 w-5 text-secondary" />
                            <h3 className="font-bold text-gray-900">Datos del Michi</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Nombre</p>
                                <p className="text-xl font-bold text-gray-900">{user.cat_name || 'Sin nombre'}</p>
                            </div>
                            
                            <div className="pt-2">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Raza</p>
                                <p className="text-lg font-medium text-gray-700">{user.cat_breed || 'No especificada'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
                        <Award className="h-5 w-5" />
                        <p className="text-sm font-medium">¡Tu gatito es parte del Club MiauHome!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
