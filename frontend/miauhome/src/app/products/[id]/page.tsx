"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Star, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

interface ProductVariation {
    id: number;
    name: string;
    variation_type?: string;
    price?: number;
    stock: number;
}

interface ProductImage {
    id: number;
    url: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    stock: number;
    variations: ProductVariation[];
    images: ProductImage[];
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const { addToCart } = useCart();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`${API_URL}/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                    if (data.variations && data.variations.length > 0) {
                        setSelectedVariation(data.variations[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, API_URL]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Producto no encontrado.</div>;

    const allImages = [product.image_url, ...(product.images?.map(img => img.url) || [])].filter(url => url && url.trim() !== "");
    
    const handleAddToCart = () => {
        addToCart(product, selectedVariation || undefined, quantity);
    };

    const currentPrice = selectedVariation?.price || product.price;

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />
            <main className="flex-1 py-8 md:py-12">
                <div className="container px-4 mx-auto">
                    <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-8 transition-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Volver al catálogo
                    </Link>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-6 md:p-10 rounded-3xl shadow-sm">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group">
                                <img 
                                    src={allImages[activeImage] || null} 
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {allImages.length > 1 && (
                                    <>
                                        <button 
                                            onClick={() => setActiveImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button 
                                            onClick={() => setActiveImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {allImages.map((img, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            <div className="mb-6">
                                <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full mb-4">
                                    {product.category}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-2 text-yellow-500 mb-4">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} size={18} className="fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">(24 reseñas)</span>
                                </div>
                                <p className="text-3xl font-bold text-primary">
                                    ${currentPrice.toLocaleString('es-CL')}
                                </p>
                            </div>

                            <div className="space-y-6 mb-8 border-t border-b py-6">
                                <p className="text-gray-600 leading-relaxed">
                                    {product.description}
                                </p>

                                {product.variations && product.variations.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                                            Selecciona una opción
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {product.variations.map((v) => (
                                                <button 
                                                    key={v.id}
                                                    onClick={() => setSelectedVariation(v)}
                                                    className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${selectedVariation?.id === v.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                                >
                                                    {v.name}
                                                    {v.price && ` (+$${(v.price - product.price).toLocaleString('es-CL')})`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-6">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                                            Cantidad
                                        </h3>
                                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                            <button 
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                className="px-4 py-2 hover:bg-gray-100 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-10 text-center font-bold">{quantity}</span>
                                            <button 
                                                onClick={() => setQuantity(q => q + 1)}
                                                className="px-4 py-2 hover:bg-gray-100 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-6">
                                        <Button 
                                            size="lg" 
                                            className="w-full rounded-xl py-6 flex items-center justify-center gap-3 text-lg"
                                            onClick={handleAddToCart}
                                        >
                                            <ShoppingCart size={24} />
                                            Añadir al Carro
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                                        🚚
                                    </div>
                                    <div>
                                        <p className="font-bold">Envío Gratis</p>
                                        <p className="text-gray-500">En compras sobre $30.000</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                                        ✨
                                    </div>
                                    <div>
                                        <p className="font-bold">Calidad Premium</p>
                                        <p className="text-gray-500">Garantía de satisfacción</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
