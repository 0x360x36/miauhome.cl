"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    User, 
    Settings, 
    ShoppingBag, 
    Cat, 
    LogOut, 
    ChevronRight, 
    PawPrint,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';

interface SidebarItemProps {
    href: string;
    icon: React.ElementType;
    label: string;
    isActive: boolean;
}

const SidebarItem = ({ href, icon: Icon, label, isActive }: SidebarItemProps) => (
    <Link 
        href={href}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
            isActive 
                ? "bg-primary text-white shadow-md shadow-primary/20" 
                : "text-gray-600 hover:bg-gray-100"
        )}
    >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
        {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
    </Link>
);

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const menuItems = [
        { href: '/profile', icon: User, label: 'Mi Perfil' },
        { href: '/profile/orders', icon: ShoppingBag, label: 'Mis Pedidos' },
        { href: '/profile/pet', icon: Cat, label: 'Mi Gato' },
        { href: '/profile/settings', icon: Settings, label: 'Configuración' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 space-y-2">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 truncate">
                                {user.first_name} {user.last_name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>

                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 space-y-1">
                            {menuItems.map((item) => (
                                <SidebarItem 
                                    key={item.href}
                                    href={item.href}
                                    icon={item.icon}
                                    label={item.label}
                                    isActive={pathname === item.href}
                                />
                            ))}
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 mt-4"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="font-medium">Cerrar Sesión</span>
                            </button>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
