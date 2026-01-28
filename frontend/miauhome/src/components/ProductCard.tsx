"use client";

import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';

interface ProductVariation {
  id: number;
  name: string;
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
  rating?: number;
  variations?: ProductVariation[];
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link href={`/products/${product.id}`} className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image_url || "/placeholder.png"}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
          {product.category}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-yellow-500 mb-2">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm font-medium text-gray-700">{product.rating || 5.0}</span>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2 h-10">
          {product.description}
        </p>
        
        {product.variations && product.variations.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.variations.slice(0, 3).map((v, i) => (
              <span key={i} className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded border border-secondary/20">
                {v.name}
              </span>
            ))}
            {product.variations.length > 3 && (
              <span className="text-[10px] text-gray-400">+{product.variations.length - 3} más</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            ${product.price.toLocaleString('es-CL')}
          </span>
          <Button size="sm" className="rounded-full h-9 w-9 p-0" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only">Agregar</span>
          </Button>
        </div>
      </div>
    </Link>
  );
}
