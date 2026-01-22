"use client";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Estado del Sistema</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">Operativo</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Accesos Rápidos</h3>
          <div className="mt-4 flex gap-2">
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">Gestionar Stock</span>
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">Ver Tickets</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Bienvenido al Panel de Control de MiauHome</h2>
        <p className="text-gray-600">
          Desde aquí puedes gestionar el inventario de productos, revisar tickets de soporte y administrar configuraciones de la tienda.
          Selecciona una opción del menú lateral para comenzar.
        </p>
      </div>
    </div>
  );
}
