"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface Product {
    id: number;
    name: string;
    price: number;
    image_url: string;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface User {
    email: string;
    full_name: string;
}

interface CartContextType {
    cart: CartItem[];
    user: User | null;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
    loginWithGoogle: (token: string) => Promise<void>;
    logout: () => void;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [user, setUser] = useState<User | null>(null);

    const API_URL = 'http://localhost:8000';

    useEffect(() => {
        // Check for existing token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // We should ideally fetch user profile here, but for now using token info if available
                // Or verify token validity
                loadCart(token);
                setUser({ email: decoded.sub, full_name: decoded.name || 'User' }); // Decode properly
            } catch (e) {
                console.error("Invalid token", e);
                localStorage.removeItem('token');
            }
        }
    }, []);

    const loadCart = async (token: string) => {
        try {
            const res = await axios.get(`${API_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const backendCart = res.data;
            if (backendCart && backendCart.items) {
                setCart(backendCart.items.map((item: any) => ({
                    product: item.product,
                    quantity: item.quantity
                })));
            }
        } catch (error) {
            console.error("Error loading cart", error);
        }
    };

    const addToCart = async (product: Product) => {
        const token = localStorage.getItem('token');
        
        // Optimistic update
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.product.id === product.id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });

        if (token) {
            try {
                await axios.post(`${API_URL}/cart/items`, {
                    product_id: product.id,
                    quantity: 1
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Error syncing cart", error);
                // Revert on error? For now, just log.
            }
        }
    };

    const removeFromCart = async (productId: number) => {
        const token = localStorage.getItem('token');
        
        setCart(prev => prev.filter(item => item.product.id !== productId));

        if (token) {
            try {
                await axios.delete(`${API_URL}/cart/items/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Error removing item", error);
            }
        }
    };

    const loginWithGoogle = async (googleToken: string) => {
        try {
            const res = await axios.post(`${API_URL}/auth/google`, { token: googleToken });
            const { access_token, user } = res.data;
            
            localStorage.setItem('token', access_token);
            setUser(user);
            
            // Load cart from backend (merging logic could be here, but for now replace)
            await loadCart(access_token);
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setCart([]); // Clear cart or keep local? Typically clear or reset to empty.
    };

    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, user, addToCart, removeFromCart, loginWithGoogle, logout, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};
