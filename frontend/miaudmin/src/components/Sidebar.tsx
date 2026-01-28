import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Users, 
  ShoppingCart, 
  Settings,
  BarChart3,
  Box,
  LogOut
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Productos', icon: Package, href: '/products' },
  { name: 'Inventario', icon: Box, href: '/inventory' },
  { name: 'Cupones y Descuentos', icon: Tag, href: '/coupons' },
  { name: 'Clientes', icon: Users, href: '/customers' },
  { name: 'Pedidos', icon: ShoppingCart, href: '/orders' },
  { name: 'Estadísticas', icon: BarChart3, href: '/stats' },
];

export function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <div className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary">Miaudmin</h1>
        {user && (
          <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t space-y-1">
        <button className="flex items-center gap-3 px-3 py-2 text-gray-700 w-full rounded-lg hover:bg-gray-100 transition-colors">
          <Settings size={20} />
          <span>Configuración</span>
        </button>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-red-600 w-full rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
