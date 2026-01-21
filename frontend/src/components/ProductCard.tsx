import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
          {product.category}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-yellow-500 mb-2">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm font-medium text-gray-700">{product.rating}</span>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            ${product.price.toLocaleString('es-CL')}
          </span>
          <Button size="sm" className="rounded-full h-9 w-9 p-0">
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only">Agregar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
