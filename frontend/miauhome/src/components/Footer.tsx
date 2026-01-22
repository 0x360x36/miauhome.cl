import Link from 'next/link';
import { PawPrint, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container px-4 md:px-6 py-12 mx-auto">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary fill-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Miau<span className="text-primary">Home</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm">
              Dedicados a hacer felices a los gatos y a sus humanos. Productos de calidad para una vida ronroneante.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Tienda</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-primary">Alimentación</Link></li>
              <li><Link href="#" className="hover:text-primary">Juguetes</Link></li>
              <li><Link href="#" className="hover:text-primary">Muebles</Link></li>
              <li><Link href="#" className="hover:text-primary">Accesorios</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-primary">Envíos</Link></li>
              <li><Link href="#" className="hover:text-primary">Devoluciones</Link></li>
              <li><Link href="#" className="hover:text-primary">Contacto</Link></li>
              <li><Link href="#" className="hover:text-primary">Preguntas Frecuentes</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Síguenos</h3>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-gray-400">
          <p>© 2024 MiauHome. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
