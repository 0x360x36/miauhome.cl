"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";

interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get("http://localhost:8000/support/admin", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data);
      } catch (error) {
        console.error("Error fetching tickets", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-yellow-100 text-yellow-700";
      case "closed": return "bg-green-100 text-green-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Soporte Técnico</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay tickets de soporte pendientes.
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    {ticket.subject}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 text-sm">{ticket.message}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                  <span>ID Usuario: {ticket.user_id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
