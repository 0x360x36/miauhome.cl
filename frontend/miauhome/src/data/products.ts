export interface ProductVariation {
  id: number;
  name: string;
  variation_type?: string;
  price?: number;
  stock: number;
}

export interface ProductImage {
  id: number;
  url: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string;
  description: string;
  rating?: number;
  stock: number;
  is_active: boolean;
  variations: ProductVariation[];
  images: ProductImage[];
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Rascador Deluxe Premium',
    price: 45990,
    category: 'Muebles',
    image_url: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=800&auto=format&fit=crop',
    description: 'Rascador de 3 niveles con hamaca y juguetes colgantes.',
    rating: 4.8,
    stock: 10,
    is_active: true,
    variations: [],
    images: []
  },
  // ... more mock products if needed, but the app fetches from backend
];
