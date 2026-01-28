"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface ProductVariation {
    id: number;
    name: string;
    variation_type?: string;
    price?: number;
    stock: number;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    stock: number;
}

interface CartItem {
    id: number;
    product: Product;
    variation?: ProductVariation;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, variation?: ProductVariation, quantity?: number) => Promise<void>;
    removeFromCart: (productId: number) => Promise<void>;
    total: number;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const { token } = useAuth();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        if (token) {
            loadCart(token);
        } else if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('guest_cart');
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            } else {
                setCart([]);
            }
        }
    }, [token]);

    const loadCart = async (authToken: string) => {
        try {
            const res = await axios.get(`${API_URL}/cart`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const backendCart = res.data;
            if (backendCart && backendCart.items) {
                setCart(backendCart.items);
            }
        } catch (error) {
            console.error("Error loading cart", error);
        }
    };

    const addToCart = async (product: Product, variation?: ProductVariation, quantity: number = 1) => {
        if (token) {
            try {
                const res = await axios.post(`${API_URL}/cart/items`, {
                    product_id: product.id,
                    variation_id: variation?.id || null,
                    quantity: quantity
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCart(res.data.items);
            } catch (error) {
                console.error("Error syncing cart", error);
                alert("Error al añadir al carro.");
            }
        } else {
            // Guest cart logic
            const newCart = [...cart];
            const existingItemIndex = newCart.findIndex(item => 
                item.product.id === product.id && 
                item.variation?.id === variation?.id
            );

            if (existingItemIndex > -1) {
                newCart[existingItemIndex].quantity += quantity;
            } else {
                newCart.push({
                    id: Math.random(), // Temporary ID
                    product: product,
                    quantity: quantity,
                    variation: variation
                });
            }
            setCart(newCart);
            localStorage.setItem('guest_cart', JSON.stringify(newCart));
        }
    };

    const removeFromCart = async (productId: number) => {
        if (token) {
            try {
                const res = await axios.delete(`${API_URL}/cart/items/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCart(res.data.items);
            } catch (error) {
                console.error("Error removing item", error);
            }
        } else {
            const newCart = cart.filter(item => item.product.id !== productId);
            setCart(newCart);
            localStorage.setItem('guest_cart', JSON.stringify(newCart));
        }
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('guest_cart');
    };

    const total = cart.reduce((sum, item) => {
        const price = item.variation?.price || item.product.price;
        return sum + (price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, total, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};
