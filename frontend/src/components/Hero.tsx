import { Button } from '@/components/ui/Button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-white py-16 md:py-24">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl text-foreground">
                Todo lo que tu <span className="text-primary">michi</span> necesita
              </h1>
              <p className="text-lg text-gray-600 max-w-[600px]">
                Descubre nuestra selección premium de juguetes, alimentos y accesorios pensados para la felicidad de tu gato.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row">
              <Button size="lg" className="px-8">
                Ver Catálogo
              </Button>
              <Button variant="outline" size="lg">
                Ofertas Especiales
              </Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[500px] lg:order-last">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl transform translate-y-10" />
            <Image
              src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop"
              alt="Gato feliz"
              width={600}
              height={600}
              className="relative rounded-3xl object-cover shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
