import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import { Plus, Search, IndianRupee, CheckCircle2, Clock, X, Save, Trash2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentsProps {
  onNavigate: (page: string, params?: any) => void;
  initialParams?: any;
}

export default function Payments({ onNavigate, initialParams }: PaymentsProps) {
  const { bookings, payments, addPayment, deletePayment } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    bookingId: initialParams?.bookingId || '',
    amount: '',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMode: 'Cash',
    notes: '',
  });

  React.useEffect(() => {
    if (initialParams?.bookingId) {
      const b = bookings.find((x) => x.id === initialParams.bookingId);
      if (b) {
        const remaining = b.totalFreight - b.amountPaid;
        setForm((p) => ({ ...p, bookingId: initialParams.bookingId, amount: remaining > 0 ? remaining.toString() : '' }));
        setShowForm(true);
      }
    }
  }, [initialParams]);

  const unpaidBookings = bookings.filter((b) => b.paymentStatus !== 'paid');

  const handleAddPayment = () => {
    if (!form.bookingId) { toast.error('Please select a booking'); return; }
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error('Please enter a valid amount'); return; }

    const booking = bookings.find((b) => b.id === form.bookingId);
    if (!booking) return;

    addPayment({
      bookingId: form.bookingId,
      wayBillNo: booking.wayBillNo,
      clientName: booking.consignorName,
      amount,
      paymentDate: form.paymentDate,
      paymentMode: form.paymentMode,
      notes: form.notes,
    });

    toast.success(`Payment of ₹${amount.toLocaleString('en-IN')} recorded!`);
    setShowForm(false);
    setForm({ bookingId: '', amount: '', paymentDate: format(new Date(), 'yyyy-MM-dd'), paymentMode: 'Cash', notes: '' });
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch = !search ||
        p.wayBillNo.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [payments, search]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch = !search ||
        b.wayBillNo.toLowerCase().includes(search.toLowerCase()) ||
        b.consignorName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, search, statusFilter]);

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const totalPending = bookings.filter((b) => b.paymentStatus !== 'paid').reduce((s, b) => s + (b.totalFreight - b.amountPaid), 0);

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Payments & Ledger</h1>
          <p className="text-xs text-gray-500">{payments.length} payment records</p>
        </div>
        <button onClick={() => { setForm({ bookingId: '', amount: '', paymentDate: format(new Date(), 'yyyy-MM-dd'), paymentMode: 'Cash', notes: '' }); setShowForm(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-green-200 transition">
          <Plus className="w-4 h-4" /> Add Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <p className="text-xs text-gray-500 font-medium">Total Received</p>
          <p className="text-xl font-bold text-green-700 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-1">{payments.length} payments</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
          <p className="text-xs text-gray-500 font-medium">Total Pending</p>
          <p className="text-xl font-bold text-red-700 mt-1">₹{totalPending.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mt-1">{unpaidBookings.length} invoices</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs text-gray-500 font-medium">Paid Invoices</p>
          <p className="text-xl font-bold text-blue-700 mt-1">{bookings.filter((b) => b.paymentStatus === 'paid').length}</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
          <p className="text-xs text-gray-500 font-medium">Partial Paid</p>
          <p className="text-xl font-bold text-orange-700 mt-1">{bookings.filter((b) => b.paymentStatus === 'partial').length}</p>
        </div>
      </div>

      {/* Add Payment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Add Payment</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Select Booking (Way Bill) *</label>
                <select value={form.bookingId} onChange={(e) => {
                  const b = bookings.find((x) => x.id === e.target.value);
                  const remaining = b ? b.totalFreight - b.amountPaid : 0;
                  setForm((p) => ({ ...p, bookingId: e.target.value, amount: remaining > 0 ? remaining.toString() : '' }));
                }}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  <option value="">-- Select Booking --</option>
                  {bookings.filter((b) => b.paymentStatus !== 'paid').map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.wayBillNo} - {b.consignorName} (₹{(b.totalFreight - b.amountPaid).toLocaleString('en-IN')} due)
                    </option>
                  ))}
                </select>
              </div>

              {form.bookingId && (() => {
                const b = bookings.find((x) => x.id === form.bookingId);
                if (!b) return null;
                return (
                  <div className="bg-blue-50 rounded-xl p-3 text-xs text-gray-600">
                    <p><b>Route:</b> {b.origin} → {b.destination}</p>
                    <p><b>Total Freight:</b> ₹{b.totalFreight.toLocaleString('en-IN')}</p>
                    <p><b>Already Paid:</b> ₹{b.amountPaid.toLocaleString('en-IN')}</p>
                    <p><b>Balance Due:</b> <span className="text-red-700 font-bold">₹{(b.totalFreight - b.amountPaid).toLocaleString('en-IN')}</span></p>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Amount (₹) *</label>
                  <input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0"
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Payment Date</label>
                  <input type="date" value={form.paymentDate} onChange={(e) => setForm((p) => ({ ...p, paymentDate: e.target.value }))}
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Payment Mode</label>
                <select value={form.paymentMode} onChange={(e) => setForm((p) => ({ ...p, paymentMode: e.target.value }))}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  {['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'NEFT', 'RTGS', 'Other'].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Notes</label>
                <input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Payment notes (optional)"
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200">Cancel</button>
              <button onClick={handleAddPayment} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                <Save className="w-4 h-4" /> Save Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Booking Ledger Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">Invoice Ledger</h2>
          <span className="text-xs text-gray-400">{filteredBookings.length} entries</span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Way Bill No', 'Date', 'Client', 'Route', 'Total', 'Paid', 'Balance', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBookings.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No entries found</td></tr>
              ) : (
                filteredBookings.map((b) => {
                  const balance = b.totalFreight - b.amountPaid;
                  const payBadge = { paid: 'bg-green-100 text-green-700', partial: 'bg-yellow-100 text-yellow-700', unpaid: 'bg-red-100 text-red-700' };
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-blue-700">{b.wayBillNo}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{format(parseISO(b.bookingDate), 'dd/MM/yyyy')}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{b.consignorName}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{b.origin} → {b.destination}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">₹{b.totalFreight.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-green-700 font-semibold">₹{b.amountPaid.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: balance > 0 ? '#c62828' : '#1b5e20' }}>₹{balance.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${payBadge[b.paymentStatus as keyof typeof payBadge]}`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {b.paymentStatus !== 'paid' && (
                          <button onClick={() => {
                            const remaining = b.totalFreight - b.amountPaid;
                            setForm({ bookingId: b.id, amount: remaining.toString(), paymentDate: format(new Date(), 'yyyy-MM-dd'), paymentMode: 'Cash', notes: '' });
                            setShowForm(true);
                          }} className="flex items-center gap-1 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
                            <Plus className="w-3 h-3" /> Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Ledger Summary Footer */}
            {filteredBookings.length > 0 && (
              <tfoot className="bg-gray-900 text-white">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-xs font-bold uppercase tracking-wide">TOTAL LEDGER BALANCE</td>
                  <td className="px-4 py-3 font-bold">₹{filteredBookings.reduce((s, b) => s + b.totalFreight, 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 font-bold text-green-300">₹{filteredBookings.reduce((s, b) => s + b.amountPaid, 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 font-bold text-red-300">₹{filteredBookings.reduce((s, b) => s + (b.totalFreight - b.amountPaid), 0).toLocaleString('en-IN')}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm p-4">No entries found</div>
          ) : (
            filteredBookings.map((b) => {
              const balance = b.totalFreight - b.amountPaid;
              return (
                <div key={b.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-700 text-sm">{b.wayBillNo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      b.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      b.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{b.paymentStatus}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{b.consignorName} | {b.origin} → {b.destination}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-gray-400">Total</p>
                      <p className="font-bold text-gray-900">₹{b.totalFreight.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <p className="text-gray-400">Paid</p>
                      <p className="font-bold text-green-700">₹{b.amountPaid.toLocaleString('en-IN')}</p>
                    </div>
                    <div className={`rounded-lg p-2 text-center ${balance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                      <p className="text-gray-400">Due</p>
                      <p className={`font-bold ${balance > 0 ? 'text-red-700' : 'text-green-700'}`}>₹{balance.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  {b.paymentStatus !== 'paid' && (
                    <button onClick={() => {
                      const remaining = b.totalFreight - b.amountPaid;
                      setForm({ bookingId: b.id, amount: remaining.toString(), paymentDate: format(new Date(), 'yyyy-MM-dd'), paymentMode: 'Cash', notes: '' });
                      setShowForm(true);
                    }} className="w-full bg-green-600 text-white text-xs py-2 rounded-xl hover:bg-green-700 transition font-medium">
                      + Add Payment
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Payment History</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No payments recorded
            </div>
          ) : (
            filteredPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{p.wayBillNo}</p>
                  <p className="text-xs text-gray-500">{p.clientName} · {p.paymentMode}</p>
                  <p className="text-xs text-gray-400">{format(parseISO(p.paymentDate), 'dd MMM yyyy')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-green-700">+₹{p.amount.toLocaleString('en-IN')}</span>
                  <button onClick={() => { if (window.confirm('Delete this payment?')) { deletePayment(p.id); toast.success('Payment deleted'); } }}
                    className="p-1.5 hover:bg-red-100 rounded-lg text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
