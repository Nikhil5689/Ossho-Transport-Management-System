import React, { useState, useMemo } from 'react';
import { useStore, Client } from '../store/useStore';
import { Plus, Search, Edit2, Trash2, Users, Phone, MapPin, X, Save, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { name: '', gst: '', phone: '', address: '', city: '' };

export default function Clients({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) {
  const { clients, addClient, updateClient, deleteClient, bookings, payments } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() =>
    clients.filter((c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    ), [clients, search]);

  const getClientStats = (clientId: string) => {
    const clientBookings = bookings.filter((b) => b.consignorId === clientId || b.consigneeId === clientId);
    const totalFreight = clientBookings.reduce((s, b) => s + b.totalFreight, 0);
    const totalPaid = clientBookings.reduce((s, b) => s + b.amountPaid, 0);
    return { bookings: clientBookings.length, totalFreight, totalPaid, balance: totalFreight - totalPaid };
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openNew = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (c: Client) => {
    setForm({ name: c.name, gst: c.gst, phone: c.phone, address: c.address, city: c.city });
    setEditId(c.id);
    setErrors({});
    setShowForm(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editId) {
      updateClient(editId, form);
      toast.success('Client updated!');
    } else {
      addClient(form);
      toast.success('Client added!');
    }
    setShowForm(false);
    setForm({ ...emptyForm });
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this client?')) {
      deleteClient(id);
      toast.success('Client deleted');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          <p className="text-xs text-gray-500">{clients.length} total clients</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-200 transition">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editId ? 'Edit Client' : 'Add New Client'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Full Name *</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Client name"
                  className={`mt-1 w-full text-sm border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">City</label>
                  <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="City"
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">GST Number</label>
                <input value={form.gst} onChange={(e) => setForm((p) => ({ ...p, gst: e.target.value }))}
                  placeholder="GST Number"
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Address</label>
                <textarea value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  rows={2} placeholder="Full address"
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-200">
                <Save className="w-4 h-4" /> {editId ? 'Update' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Client', 'Phone', 'City', 'GST', 'Bookings', 'Total Freight', 'Paid', 'Balance Due', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No clients found
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const stats = getClientStats(c.id);
                return (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 text-xs font-bold">{c.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.phone || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.city || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.gst || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">{stats.bookings}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{stats.totalFreight.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-green-700 font-semibold">₹{stats.totalPaid.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: stats.balance > 0 ? '#c62828' : '#1b5e20' }}>
                      ₹{stats.balance.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No clients found
          </div>
        ) : (
          filtered.map((c) => {
            const stats = getClientStats(c.id);
            return (
              <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                      {c.city && <p className="text-xs text-gray-400">{c.city}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-2 bg-gray-100 rounded-lg"><Edit2 className="w-3.5 h-3.5 text-gray-600" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-100 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <p className="text-gray-400">Bookings</p>
                    <p className="font-bold text-gray-900">{stats.bookings}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2 text-center">
                    <p className="text-gray-400">Paid</p>
                    <p className="font-bold text-green-700">₹{stats.totalPaid.toLocaleString('en-IN')}</p>
                  </div>
                  <div className={`rounded-xl p-2 text-center ${stats.balance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className="text-gray-400">Balance</p>
                    <p className={`font-bold ${stats.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>₹{stats.balance.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
