"use client";

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { PawPrint, Loader2, ArrowRight, ArrowLeft, MapPin, Cat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const mapContainerStyle = {
    width: '100%',
    height: '200px',
    borderRadius: '0.5rem'
};

const center = {
    lat: -33.4489, // Santiago, Chile
    lng: -70.6693
};

import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
    const { login: authLogin } = useAuth();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        address: '',
        city: 'Santiago',
        region: 'Metropolitana',
        catName: '',
        catBreed: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState(center);
    const router = useRouter();

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        if (step === 0) {
            if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
                setError('Por favor completa todos los campos');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Las contraseñas no coinciden');
                return;
            }
        } else if (step === 1) {
            if (!formData.address) {
                setError('Por favor ingresa tu dirección');
                return;
            }
        }
        setError('');
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await axios.post(`${API_URL}/register`, {
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName,
                address: formData.address,
                city: formData.city,
                region: formData.region,
                cat_name: formData.catName,
                cat_breed: formData.catBreed
            });
            
            // Login automatically after registration
            const loginRes = await axios.post(`${API_URL}/login`, {
                email: formData.email,
                password: formData.password
            });

            if (loginRes.data.access_token) {
                authLogin(loginRes.data.access_token);
                router.push('/');
            } else {
                router.push('/auth/login?registered=true');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al registrarse');
        } finally {
            setIsLoading(false);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 500 : -500,
            opacity: 0
        })
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
            <div className="w-full max-w-md space-y-8 relative">
                <div className="flex flex-col items-center">
                    <Link href="/" className="flex items-center gap-2 mb-4">
                        <PawPrint className="h-10 w-10 text-primary fill-primary" />
                        <span className="text-2xl font-bold tracking-tight text-foreground">
                            Miau<span className="text-primary">Home</span>
                        </span>
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {step === 0 ? 'Crea tu cuenta' : step === 1 ? 'Tu ubicación' : 'Sobre tu gatito'}
                    </h2>
                    <div className="flex gap-2 mt-4">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`h-2 w-8 rounded-full transition-colors ${
                                    step === i ? 'bg-primary' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="relative h-[450px]">
                    <AnimatePresence initial={false} custom={step}>
                        <motion.div
                            key={step}
                            custom={step}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="absolute inset-0 w-full"
                        >
                            <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
                                {error && (
                                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                {step === 0 && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                name="firstName"
                                                type="text"
                                                required
                                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                                placeholder="Nombre"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                            />
                                            <input
                                                name="lastName"
                                                type="text"
                                                required
                                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                                placeholder="Apellido"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                            placeholder="Correo electrónico"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                            placeholder="Contraseña"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                            placeholder="Confirmar contraseña"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )}

                                {step === 1 && (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <input
                                                name="address"
                                                type="text"
                                                required
                                                className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                                placeholder="Tu dirección completa"
                                                value={formData.address}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="border rounded-lg overflow-hidden h-[250px] bg-gray-100 flex items-center justify-center">
                                            {isLoaded ? (
                                                <GoogleMap
                                                    mapContainerStyle={mapContainerStyle}
                                                    center={mapCenter}
                                                    zoom={15}
                                                >
                                                    <Marker position={mapCenter} />
                                                </GoogleMap>
                                            ) : (
                                                <div className="text-gray-400 flex flex-col items-center">
                                                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                                    <span>Cargando mapa...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-4 text-center">
                                        <div className="flex justify-center mb-6">
                                            <div className="bg-primary/10 p-4 rounded-full">
                                                <Cat className="h-12 w-12 text-primary" />
                                            </div>
                                        </div>
                                        <input
                                            name="catName"
                                            type="text"
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                            placeholder="Nombre del gato"
                                            value={formData.catName}
                                            onChange={handleChange}
                                        />
                                        <input
                                            name="catBreed"
                                            type="text"
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                            placeholder="Raza"
                                            value={formData.catBreed}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    {step > 0 && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="flex-1"
                                            onClick={handleBack}
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Atrás
                                        </Button>
                                    )}
                                    {step < 2 ? (
                                        <Button
                                            type="button"
                                            className="flex-1 bg-primary text-white"
                                            onClick={handleNext}
                                        >
                                            Siguiente
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            className="flex-1 bg-primary text-white"
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Completar Registro
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
