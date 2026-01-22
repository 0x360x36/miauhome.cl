export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  rating: number;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Rascador Deluxe Premium',
    price: 45990,
    category: 'Muebles',
    image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=800&auto=format&fit=crop',
    description: 'Rascador de 3 niveles con hamaca y juguetes colgantes.',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Fuente de Agua Inteligente',
    price: 32990,
    category: 'Alimentación',
    image: 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?q=80&w=800&auto=format&fit=crop',
    description: 'Agua fresca y filtrada 24/7 para tu michi. Silenciosa y fácil de limpiar.',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Cama Iglú Acolchada',
    price: 24990,
    category: 'Descanso',
    image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=800&auto=format&fit=crop',
    description: 'Refugio suave y cálido, perfecto para los días fríos.',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Juguete Láser Automático',
    price: 15990,
    category: 'Juguetes',
    image: 'https://images.unsplash.com/photo-1615802187760-b610c1f59247?q=80&w=800&auto=format&fit=crop',
    description: 'Horas de diversión garantizada con patrones aleatorios.',
    rating: 4.5,
  },
  {
    id: '5',
    name: 'Mochila Transportadora Espacial',
    price: 38990,
    category: 'Transporte',
    image: 'https://images.unsplash.com/photo-1598284693774-7049405d4546?q=80&w=800&auto=format&fit=crop',
    description: 'Lleva a tu gato a todas partes con estilo y seguridad.',
    rating: 4.7,
  },
  {
    id: '6',
    name: 'Pack Paté Gourmet x12',
    price: 12990,
    category: 'Alimentación',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop',
    description: 'Sabores surtidos: Salmón, Atún, Pollo y Pavo.',
    rating: 4.9,
  },
];
