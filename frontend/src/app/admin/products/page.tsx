"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash, X, Save, Search } from "lucide-react";

interface Product {
  id: int;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isEditing, setIsEditing] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      await axios.delete(`http://localhost:8000/products/${id}`, authHeaders);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      alert("Error al eliminar producto");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: currentProduct.name,
        description: currentProduct.description,
        price: Number(currentProduct.price),
        image_url: currentProduct.image_url,
        category: currentProduct.category,
        stock: Number(currentProduct.stock || 0)
      };

      if (isEditing && currentProduct.id) {
        await axios.put(`http://localhost:8000/products/${currentProduct.id}`, payload, authHeaders);
      } else {
        await axios.post("http://localhost:8000/products", payload, authHeaders);
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Error al guardar producto");
    }
  };

  const openNewModal = () => {
    setCurrentProduct({ category: "Juguetes", stock: 0 });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Inventario de Productos</h1>
        <button 
          onClick={openNewModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                    <div className="font-medium text-gray-800">{product.name}</div>
                  </td>
                  <td className="p-4 text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    ${product.price.toLocaleString("es-CL")}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock} un.
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => openEditModal(product)}
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {isEditing ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  required
                  className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={currentProduct.name || ""}
                  onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input 
                    type="number"
                    required
                    className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={currentProduct.price || ""}
                    onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input 
                    type="number"
                    required
                    className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={currentProduct.stock || 0}
                    onChange={e => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={currentProduct.category || "Juguetes"}
                  onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                >
                    <option value="Alimentación">Alimentación</option>
                    <option value="Juguetes">Juguetes</option>
                    <option value="Muebles">Muebles</option>
                    <option value="Descanso">Descanso</option>
                    <option value="Transporte">Transporte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen URL</label>
                <input 
                  required
                  className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={currentProduct.image_url || ""}
                  onChange={e => setCurrentProduct({...currentProduct, image_url: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={currentProduct.description || ""}
                  onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
