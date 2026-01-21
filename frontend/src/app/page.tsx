import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { Footer } from '@/components/Footer';
import { products } from '@/data/products';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Hero />
        
        <section className="py-16 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  Productos Destacados
                </h2>
                <p className="text-gray-500 mt-2">
                  Lo mejor para tu compañero felino, seleccionado con amor.
                </p>
              </div>
              <Button variant="outline">Ver todo el catálogo</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="rounded-3xl bg-secondary overflow-hidden shadow-xl">
              <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
                <div className="space-y-4 text-white">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    ¡Únete al Club Miau!
                  </h2>
                  <p className="text-white/90 text-lg">
                    Recibe ofertas exclusivas, consejos de expertos y un 10% de descuento en tu primera compra.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <input 
                      type="email" 
                      placeholder="Tu correo electrónico" 
                      className="px-4 py-3 rounded-full text-foreground w-full md:max-w-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button variant="primary" className="bg-white text-secondary hover:bg-white/90">
                      Suscribirse
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block relative h-64">
                   {/* Decorative elements or illustration could go here */}
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 text-9xl opacity-20 rotate-12 select-none">
                     🐱
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
