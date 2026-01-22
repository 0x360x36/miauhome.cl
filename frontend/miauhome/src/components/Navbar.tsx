"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, PawPrint, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { GoogleLogin } from '@react-oauth/google';

export function Navbar() {
  const { cart, user, loginWithGoogle, logout } = useCart();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <PawPrint className="h-8 w-8 text-primary fill-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Miau<span className="text-primary">Home</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex gap-6 items-center font-medium text-sm">
          <Link href="#" className="text-foreground/80 hover:text-primary transition-colors">
            Alimentación
          </Link>
          <Link href="#" className="text-foreground/80 hover:text-primary transition-colors">
            Juguetes
          </Link>
          <Link href="#" className="text-foreground/80 hover:text-primary transition-colors">
            Muebles
          </Link>
          <Link href="#" className="text-foreground/80 hover:text-primary transition-colors">
            Salud
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hidden md:flex relative group">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              {cartItemCount}
            </span>
            <span className="sr-only">Carrito</span>
          </Button>
          
          {user ? (
             <div className="flex items-center gap-2">
                <span className="text-sm font-medium hidden md:inline-block">Hola, {user.full_name}</span>
                <Button variant="ghost" size="sm" onClick={logout} title="Cerrar sesión">
                    <LogOut className="h-5 w-5" />
                </Button>
             </div>
          ) : (
             <div className="hidden md:block">
                 <GoogleLogin
                    onSuccess={credentialResponse => {
                        if (credentialResponse.credential) {
                            loginWithGoogle(credentialResponse.credential);
                        }
                    }}
                    onError={() => {
                        console.log('Login Failed');
                    }}
                    useOneTap
                    type="icon"
                    shape="circle"
                 />
             </div>
          )}

          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
