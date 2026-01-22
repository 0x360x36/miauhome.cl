"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Tag, Trash } from "lucide-react";

interface Discount {
  id: number;
  code: string;
  percentage: number;
  valid_until: string;
  is_active: boolean;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    code: "",
    percentage: 10,
    valid_until: ""
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/discounts", authHeaders);
      setDiscounts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure date is ISO
      const payload = {
        ...newDiscount,
        valid_until: new Date(newDiscount.valid_until).toISOString()
      };
      await axios.post("http://localhost:8000/discounts", payload, authHeaders);
      setIsModalOpen(false);
      fetchDiscounts();
      setNewDiscount({ code: "", percentage: 10, valid_until: "" });
    } catch (error) {
      alert("Error creando descuento");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Cupones de Descuento</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Cupón
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {discounts.map((discount) => (
          <div key={discount.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-lg text-gray-800">{discount.code}</span>
              </div>
              <p className="text-sm text-gray-500">Descuento: {discount.percentage}%</p>
              <p className="text-xs text-gray-400 mt-1">
                Vence: {new Date(discount.valid_until).toLocaleDateString()}
              </p>
            </div>
            <div className={`h-3 w-3 rounded-full ${discount.is_active ? 'bg-green-500' : 'bg-red-500'}`} title={discount.is_active ? "Activo" : "Inactivo"} />
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Crear Nuevo Cupón</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <input 
                  required
                  className="w-full border p-2 rounded-lg"
                  value={newDiscount.code}
                  onChange={e => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})}
                  placeholder="Ej: MIAU2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Porcentaje</label>
                <input 
                  type="number"
                  required
                  min="1"
                  max="100"
                  className="w-full border p-2 rounded-lg"
                  value={newDiscount.percentage}
                  onChange={e => setNewDiscount({...newDiscount, percentage: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Válido hasta</label>
                <input 
                  type="date"
                  required
                  className="w-full border p-2 rounded-lg"
                  value={newDiscount.valid_until}
                  onChange={e => setNewDiscount({...newDiscount, valid_until: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
