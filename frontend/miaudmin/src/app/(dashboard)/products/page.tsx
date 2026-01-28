"use client"

import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { Plus, Search, Edit2, Trash2, Package, X, Save } from 'lucide-react';
import api from '@/lib/api';

interface ProductVariation {
  id?: number;
  name: string;
  variation_type?: string;
  price?: number;
  stock: number;
}

interface ProductImage {
  id?: number;
  url: string;
}

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  is_active: boolean;
  variations: ProductVariation[];
  images: ProductImage[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error: any) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        ...product, 
        variations: product.variations || [], 
        images: product.images || [],
        is_active: product.is_active ?? true
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: 'Muebles',
        stock: 0,
        is_active: true,
        variations: [],
        images: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error al guardar el producto.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const addVariation = () => {
    setFormData({
      ...formData,
      variations: [...formData.variations, { name: '', variation_type: 'color', stock: 0 }]
    });
  };

  const removeVariation = (index: number) => {
    const newVariations = [...formData.variations];
    newVariations.splice(index, 1);
    setFormData({ ...formData, variations: newVariations });
  };

  const updateVariation = (index: number, field: keyof ProductVariation, value: string | number) => {
    const newVariations = [...formData.variations];
    newVariations[index] = { ...newVariations[index], [field]: value };
    setFormData({ ...formData, variations: newVariations });
  };

  const addImage = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { url: '' }]
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], url: value };
    setFormData({ ...formData, images: newImages });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Productos</h2>
          <p className="text-gray-600">Gestiona el catálogo, inventarios y variaciones.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-gray-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-500">
                <th className="px-6 py-4 font-medium text-center w-16">Imagen</th>
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Categoría</th>
                <th className="px-6 py-4 font-medium">Precio</th>
                <th className="px-6 py-4 font-medium text-center">Variaciones / Stock</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Cargando productos...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No hay productos que coincidan con la búsqueda.</td></tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={20} />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{product.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.is_active ? 'Activo' : 'Deslistado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    ${product.price.toLocaleString('es-CL')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {product.variations && product.variations.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-1">
                        {product.variations.map((v, i) => (
                          <span key={i} className="text-[10px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded border border-pink-100">
                            {v.name}: {v.stock}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">{product.stock} en stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Product Creation/Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="checkbox" 
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Listado en el sitio principal</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Nombre</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500/20 outline-none text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Categoría</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500/20 outline-none bg-white text-gray-700"
                  >
                    <option>Muebles</option>
                    <option>Alimentación</option>
                    <option>Descanso</option>
                    <option>Juguetes</option>
                    <option>Higiene</option>
                    <option>Transporte</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Descripción</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500/20 outline-none text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Precio Base</label>
                  <input 
                    required
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500/20 outline-none text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">URL Imagen Principal</label>
                  <input 
                    type="text" 
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500/20 outline-none text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-800">Imágenes Adicionales</h4>
                  <button 
                    type="button"
                    onClick={addImage}
                    className="text-sm flex items-center gap-1 text-pink-600 hover:text-pink-700 font-medium"
                  >
                    <Plus size={16} /> Añadir Imagen
                  </button>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="space-y-2">
                    {formData.images.map((img, i) => (
                      <div key={i} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <input 
                          type="text"
                          value={img.url}
                          onChange={(e) => updateImage(i, e.target.value)}
                          className="flex-1 px-3 py-1.5 border rounded text-sm text-gray-700"
                          placeholder="URL de la imagen"
                        />
                        <button 
                          type="button"
                          onClick={() => removeImage(i)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-800">Variaciones (Colores, Formas, etc.)</h4>
                  <button 
                    type="button"
                    onClick={addVariation}
                    className="text-sm flex items-center gap-1 text-pink-600 hover:text-pink-700 font-medium"
                  >
                    <Plus size={16} /> Añadir Variación
                  </button>
                </div>
                
                {formData.variations.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                    <p>No hay variaciones. Se usará el stock general.</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <label>Stock general:</label>
                      <input 
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                        className="w-24 px-2 py-1 border rounded text-center text-gray-700"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.variations.map((v, i) => (
                      <div key={i} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Tipo (Color, Talla, etc.)</label>
                          <select 
                            value={v.variation_type || 'color'}
                            onChange={(e) => updateVariation(i, 'variation_type', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded text-sm text-gray-700"
                          >
                            <option value="color">Color</option>
                            <option value="shape">Forma</option>
                            <option value="size">Talla/Tamaño</option>
                            <option value="material">Material</option>
                          </select>
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Valor (ej: Rojo, Corazón)</label>
                          <input 
                            type="text"
                            value={v.name}
                            onChange={(e) => updateVariation(i, 'name', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded text-sm text-gray-700"
                            placeholder="Nombre"
                          />
                        </div>
                        <div className="w-20 space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Stock</label>
                          <input 
                            type="number"
                            value={v.stock}
                            onChange={(e) => updateVariation(i, 'stock', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 border rounded text-sm text-gray-700"
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Precio Op.</label>
                          <input 
                            type="number"
                            placeholder="Base"
                            value={v.price || ''}
                            onChange={(e) => updateVariation(i, 'price', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 border rounded text-sm text-gray-700"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeVariation(i)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <Save size={20} />
                  <span>{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
