import React, { useState, useEffect, useMemo } from 'react';
import { useStore, Booking } from '../store/useStore';
import {
  Plus, Search, Filter, Eye, Edit2, Trash2, FileText,
  ArrowRight, Package, CheckCircle2, Truck, Clock,
  X, ChevronDown, IndianRupee, Phone, MapPin, Save, Printer
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

interface BookingsProps {
  onNavigate: (page: string, params?: any) => void;
  initialParams?: any;
}

const emptyCharges = { freight: 0, hamali: 0, docket: 50, doorCollection: 0, other: 0, total: 50 };

const emptyForm = {
  bookingDate: format(new Date(), 'yyyy-MM-dd'),
  origin: '',
  destination: '',
  consignorId: '',
  consignorName: '',
  consignorPhone: '',
  consignorAddress: '',
  consignorGst: '',
  consigneeId: '',
  consigneeName: '',
  consigneePhone: '',
  consigneeAddress: '',
  consigneeGst: '',
  invoiceNo: '',
  invoiceDate: format(new Date(), 'yyyy-MM-dd'),
  invoiceValue: '',
  material: '',
  packages: 1,
  packingType: 'Box',
  actualWeight: 0,
  chargeWeight: 0,
  paymentMode: 'toPay' as 'toPay' | 'paid' | 'tBB',
  charges: { ...emptyCharges },
  totalFreight: 50,
  status: 'pending' as 'pending' | 'in_transit' | 'delivered',
  paymentStatus: 'unpaid' as 'unpaid' | 'partial' | 'paid',
  amountPaid: 0,
  notes: '',
};

export default function Bookings({ onNavigate, initialParams }: BookingsProps) {
  const { bookings, clients, addBooking, updateBooking, deleteBooking, addClient } = useStore();
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [editId, setEditId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payFilter, setPayFilter] = useState('all');
  const [form, setForm] = useState({ ...emptyForm });
  const [consignorSearch, setConsignorSearch] = useState('');
  const [consigneeSearch, setConsigneeSearch] = useState('');
  const [showConsignorDropdown, setShowConsignorDropdown] = useState(false);
  const [showConsigneeDropdown, setShowConsigneeDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialParams?.action === 'new') {
      openNewForm();
    } else if (initialParams?.view) {
      const b = bookings.find((x) => x.id === initialParams.view);
      if (b) { setViewId(b.id); setView('detail'); }
    }
  }, [initialParams]);

  const openNewForm = () => {
    setForm({ ...emptyForm, bookingDate: format(new Date(), 'yyyy-MM-dd'), invoiceDate: format(new Date(), 'yyyy-MM-dd') });
    setEditId(null);
    setConsignorSearch('');
    setConsigneeSearch('');
    setErrors({});
    setView('form');
  };

  const openEdit = (b: Booking) => {
    setForm({
      bookingDate: b.bookingDate,
      origin: b.origin,
      destination: b.destination,
      consignorId: b.consignorId,
      consignorName: b.consignorName,
      consignorPhone: b.consignorPhone,
      consignorAddress: b.consignorAddress,
      consignorGst: b.consignorGst,
      consigneeId: b.consigneeId,
      consigneeName: b.consigneeName,
      consigneePhone: b.consigneePhone,
      consigneeAddress: b.consigneeAddress,
      consigneeGst: b.consigneeGst,
      invoiceNo: b.invoiceNo,
      invoiceDate: b.invoiceDate,
      invoiceValue: b.invoiceValue,
      material: b.material,
      packages: b.packages,
      packingType: b.packingType,
      actualWeight: b.actualWeight,
      chargeWeight: b.chargeWeight,
      paymentMode: b.paymentMode,
      charges: { ...b.charges },
      totalFreight: b.totalFreight,
      status: b.status,
      paymentStatus: b.paymentStatus,
      amountPaid: b.amountPaid,
      notes: b.notes,
    });
    setConsignorSearch(b.consignorName);
    setConsigneeSearch(b.consigneeName);
    setEditId(b.id);
    setErrors({});
    setView('form');
  };

  const calcTotal = (charges: typeof emptyCharges) => {
    return (charges.freight || 0) + (charges.hamali || 0) + (charges.docket || 0) + (charges.doorCollection || 0) + (charges.other || 0);
  };

  const updateCharge = (field: keyof typeof emptyCharges, val: number) => {
    setForm((prev) => {
      const updated = { ...prev.charges, [field]: val };
      updated.total = calcTotal(updated);
      return { ...prev, charges: updated, totalFreight: updated.total };
    });
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.origin.trim()) errs.origin = 'Origin is required';
    if (!form.destination.trim()) errs.destination = 'Destination is required';
    if (!form.consignorName.trim()) errs.consignorName = 'Consignor name is required';
    if (!form.consigneeName.trim()) errs.consigneeName = 'Consignee name is required';
    if (!form.material.trim()) errs.material = 'Material is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (andGenerate = false) => {
    if (!validateForm()) { toast.error('Please fill all required fields'); return; }

    // Auto-save consignor if not existing
    let consignorId = form.consignorId;
    if (!consignorId && form.consignorName) {
      const existing = clients.find((c) => c.name.toLowerCase() === form.consignorName.toLowerCase());
      if (existing) { consignorId = existing.id; }
      else {
        const nc = addClient({ name: form.consignorName, phone: form.consignorPhone, address: form.consignorAddress, gst: form.consignorGst, city: form.origin });
        consignorId = nc.id;
      }
    }
    let consigneeId = form.consigneeId;
    if (!consigneeId && form.consigneeName) {
      const existing = clients.find((c) => c.name.toLowerCase() === form.consigneeName.toLowerCase());
      if (existing) { consigneeId = existing.id; }
      else {
        const nc = addClient({ name: form.consigneeName, phone: form.consigneePhone, address: form.consigneeAddress, gst: form.consigneeGst, city: form.destination });
        consigneeId = nc.id;
      }
    }

    const bookingData = { ...form, consignorId, consigneeId };

    if (editId) {
      updateBooking(editId, bookingData);
      toast.success('Booking updated successfully!');
      if (andGenerate) {
        onNavigate('invoice', { bookingId: editId });
      } else {
        setView('list');
      }
    } else {
      const newBooking = addBooking(bookingData);
      toast.success(`Docket ${newBooking.wayBillNo} saved successfully!`);
      if (andGenerate) {
        onNavigate('invoice', { bookingId: newBooking.id });
      } else {
        setView('list');
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this booking? This cannot be undone.')) {
      deleteBooking(id);
      toast.success('Booking deleted');
      if (view === 'detail') setView('list');
    }
  };

  const handleStatusUpdate = (id: string, status: Booking['status']) => {
    updateBooking(id, { status });
    toast.success(`Status updated to ${status.replace('_', ' ')}`);
  };

  const selectClient = (type: 'consignor' | 'consignee', client: any) => {
    if (type === 'consignor') {
      setForm((p) => ({ ...p, consignorId: client.id, consignorName: client.name, consignorPhone: client.phone, consignorAddress: client.address, consignorGst: client.gst }));
      setConsignorSearch(client.name);
      setShowConsignorDropdown(false);
    } else {
      setForm((p) => ({ ...p, consigneeId: client.id, consigneeName: client.name, consigneePhone: client.phone, consigneeAddress: client.address, consigneeGst: client.gst }));
      setConsigneeSearch(client.name);
      setShowConsigneeDropdown(false);
    }
  };

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch = !search || b.wayBillNo.toLowerCase().includes(search.toLowerCase()) ||
        b.consignorName.toLowerCase().includes(search.toLowerCase()) ||
        b.consigneeName.toLowerCase().includes(search.toLowerCase()) ||
        b.origin.toLowerCase().includes(search.toLowerCase()) ||
        b.destination.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchPay = payFilter === 'all' || b.paymentStatus === payFilter;
      return matchSearch && matchStatus && matchPay;
    });
  }, [bookings, search, statusFilter, payFilter]);

  const viewBooking = bookings.find((b) => b.id === viewId);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { pending: 'bg-orange-100 text-orange-700', in_transit: 'bg-blue-100 text-blue-700', delivered: 'bg-green-100 text-green-700' };
    return map[status] || 'bg-gray-100 text-gray-600';
  };
  const payBadge = (status: string) => {
    const map: Record<string, string> = { unpaid: 'bg-red-100 text-red-700', partial: 'bg-yellow-100 text-yellow-700', paid: 'bg-green-100 text-green-700' };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  // =================== DETAIL VIEW ===================
  if (view === 'detail' && viewBooking) {
    return (
      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">{viewBooking.wayBillNo}</h1>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(viewBooking.status)}`}>
            {viewBooking.status.replace('_', ' ')}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${payBadge(viewBooking.paymentStatus)}`}>
            {viewBooking.paymentStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Route Info</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">{viewBooking.origin}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-700">{viewBooking.destination}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{format(parseISO(viewBooking.bookingDate), 'dd MMM yyyy')}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Freight</h3>
            <p className="text-2xl font-bold text-gray-900">₹{viewBooking.totalFreight.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-1">Paid: ₹{viewBooking.amountPaid.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wide">Consignor</h3>
            <p className="font-semibold text-gray-900">{viewBooking.consignorName}</p>
            {viewBooking.consignorPhone && <p className="text-xs text-gray-500 mt-1">{viewBooking.consignorPhone}</p>}
            {viewBooking.consignorAddress && <p className="text-xs text-gray-400 mt-0.5">{viewBooking.consignorAddress}</p>}
            {viewBooking.consignorGst && <p className="text-xs text-gray-400 mt-0.5">GST: {viewBooking.consignorGst}</p>}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wide">Consignee</h3>
            <p className="font-semibold text-gray-900">{viewBooking.consigneeName}</p>
            {viewBooking.consigneePhone && <p className="text-xs text-gray-500 mt-1">{viewBooking.consigneePhone}</p>}
            {viewBooking.consigneeAddress && <p className="text-xs text-gray-400 mt-0.5">{viewBooking.consigneeAddress}</p>}
            {viewBooking.consigneeGst && <p className="text-xs text-gray-400 mt-0.5">GST: {viewBooking.consigneeGst}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Shipment Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { label: 'Material', value: viewBooking.material },
              { label: 'Packages', value: `${viewBooking.packages} ${viewBooking.packingType}` },
              { label: 'Actual Weight', value: `${viewBooking.actualWeight} kg` },
              { label: 'Charge Weight', value: `${viewBooking.chargeWeight} kg` },
              { label: 'Invoice No', value: viewBooking.invoiceNo || '-' },
              { label: 'Invoice Value', value: viewBooking.invoiceValue ? `₹${viewBooking.invoiceValue}` : '-' },
              { label: 'Payment Mode', value: viewBooking.paymentMode },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-gray-400 font-medium mb-0.5">{item.label}</p>
                <p className="text-gray-800 font-semibold capitalize">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Charges Breakdown</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Freight', val: viewBooking.charges.freight },
              { label: 'Hamali', val: viewBooking.charges.hamali },
              { label: 'Docket Charges', val: viewBooking.charges.docket },
              { label: 'Door Collection', val: viewBooking.charges.doorCollection },
              { label: 'Other', val: viewBooking.charges.other },
            ].map((c) => c.val > 0 && (
              <div key={c.label} className="flex justify-between text-gray-600">
                <span>{c.label}</span>
                <span>₹{c.val.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2">
              <span>Total Freight</span>
              <span>₹{viewBooking.totalFreight.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pb-4">
          <button onClick={() => openEdit(viewBooking)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button onClick={() => onNavigate('invoice', { bookingId: viewBooking.id })} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            <FileText className="w-4 h-4" /> View Invoice
          </button>
          {viewBooking.status !== 'delivered' && (
            <button onClick={() => handleStatusUpdate(viewBooking.id, 'delivered')} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition">
              <CheckCircle2 className="w-4 h-4" /> Mark Delivered
            </button>
          )}
          {viewBooking.status === 'pending' && (
            <button onClick={() => handleStatusUpdate(viewBooking.id, 'in_transit')} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition">
              <Truck className="w-4 h-4" /> Mark In Transit
            </button>
          )}
          <button onClick={() => onNavigate('payments', { bookingId: viewBooking.id })} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition">
            <IndianRupee className="w-4 h-4" /> Add Payment
          </button>
          <button onClick={() => handleDelete(viewBooking.id)} className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition border border-red-200">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    );
  }

  // =================== FORM VIEW ===================
  if (view === 'form') {
    const consignorFiltered = clients.filter((c) =>
      c.name.toLowerCase().includes(consignorSearch.toLowerCase()) && consignorSearch.length > 0
    );
    const consigneeFiltered = clients.filter((c) =>
      c.name.toLowerCase().includes(consigneeSearch.toLowerCase()) && consigneeSearch.length > 0
    );

    return (
      <div className="pb-24 lg:pb-8">
        <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
            <h1 className="text-lg font-bold text-gray-900">{editId ? 'Edit Booking' : 'New Booking'}</h1>
          </div>

          {/* Section 1: Auto Data */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Auto Data</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Way Bill No</label>
                <div className="mt-1 text-sm font-bold text-blue-700 bg-blue-50 px-3 py-2.5 rounded-xl">
                  {editId ? bookings.find((b) => b.id === editId)?.wayBillNo : 'Auto-generated'}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Booking Date *</label>
                <input type="date" value={form.bookingDate}
                  onChange={(e) => setForm((p) => ({ ...p, bookingDate: e.target.value }))}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Section 2: Route */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Route</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">From (Origin) *</label>
                <input value={form.origin} onChange={(e) => setForm((p) => ({ ...p, origin: e.target.value }))}
                  placeholder="e.g. Raipur"
                  className={`mt-1 w-full text-sm border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.origin ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">To (Destination) *</label>
                <input value={form.destination} onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))}
                  placeholder="e.g. Bilaspur"
                  className={`mt-1 w-full text-sm border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.destination ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Consignor */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Consignor (Sender)</h2>
            <div className="space-y-3">
              <div className="relative">
                <label className="text-xs text-gray-500 font-medium">Name *</label>
                <input value={consignorSearch}
                  onChange={(e) => { setConsignorSearch(e.target.value); setForm((p) => ({ ...p, consignorName: e.target.value, consignorId: '' })); setShowConsignorDropdown(true); }}
                  onFocus={() => setShowConsignorDropdown(true)}
                  onBlur={() => setTimeout(() => setShowConsignorDropdown(false), 200)}
                  placeholder="Search or enter consignor name"
                  className={`mt-1 w-full text-sm border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.consignorName ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.consignorName && <p className="text-xs text-red-500 mt-1">{errors.consignorName}</p>}
                {showConsignorDropdown && consignorFiltered.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {consignorFiltered.map((c) => (
                      <button key={c.id} onMouseDown={() => selectClient('consignor', c)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition">
                        <span className="font-medium">{c.name}</span>
                        {c.phone && <span className="text-gray-400 ml-2 text-xs">{c.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Phone</label>
                  <input value={form.consignorPhone} onChange={(e) => setForm((p) => ({ ...p, consignorPhone: e.target.value }))}
                    placeholder="Phone number"
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">GST Number</label>
                  <input value={form.consignorGst} onChange={(e) => setForm((p) => ({ ...p, consignorGst: e.target.value }))}
                    placeholder="GST No"
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Address</label>
                <input value={form.consignorAddress} onChange={(e) => setForm((p) => ({ ...p, consignorAddress: e.target.value }))}
                  placeholder="Address"
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Section 4: Consignee */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Consignee (Receiver)</h2>
            <div className="space-y-3">
              <div className="relative">
                <label className="text-xs text-gray-500 font-medium">Name *</label>
                <input value={consigneeSearch}
                  onChange={(e) => { setConsigneeSearch(e.target.value); setForm((p) => ({ ...p, consigneeName: e.target.value, consigneeId: '' })); setShowConsigneeDropdown(true); }}
                  onFocus={() => setShowConsigneeDropdown(true)}
                  onBlur={() => setTimeout(() => setShowConsigneeDropdown(false), 200)}
                  placeholder="Search or enter consignee name"
                  className={`mt-1 w-full text-sm border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.consigneeName ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.consigneeName && <p className="text-xs text-red-500 mt-1">{errors.consigneeName}</p>}
                {showConsigneeDropdown && consigneeFiltered.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {consigneeFiltered.map((c) => (
                      <button key={c.id} onMouseDown={() => selectClient('consignee', c)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition">
                        <span className="font-medium">{c.name}</span>
                        {c.phone && <span className="text-gray-400 ml-2 text-xs">{c.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Phone</label>
                  <input value={form.consigneePhone} onChange={(e) => setForm((p) => ({ ...p, consigneePhone: e.target.value }))}
                    placeholder="Phone number"
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">GST Number</label>
                  <input value={form.consigneeGst} onChange={(e) => setForm((p) => ({ ...p, consigneeGst: e.target.value }))}
                    placeholder="GST No"
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Address</label>
                <input value={form.consigneeAddress} onChange={(e) => setForm((p) => ({ ...p, consigneeAddress: e.target.value }))}
                  placeholder="Address"
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Section 5: Shipment */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Shipment Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Material Description *</label>
                <input value={form.material} onChange={(e) => setForm((p) => ({ ...p, material: e.target.value }))}
                  placeholder="e.g. Electronics, Furniture"
                  className={`mt-1 w-full text-sm border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.material ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.material && <p className="text-xs text-red-500 mt-1">{errors.material}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Packages</label>
                  <input type="number" value={form.packages} min={1}
                    onChange={(e) => setForm((p) => ({ ...p, packages: parseInt(e.target.value) || 1 }))}
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Packing Type</label>
                  <select value={form.packingType} onChange={(e) => setForm((p) => ({ ...p, packingType: e.target.value }))}
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {['Box', 'Bag', 'Bundle', 'Carton', 'Drum', 'Pallet', 'Roll', 'Tin', 'Other'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Actual Weight (kg)</label>
                  <input type="number" value={form.actualWeight} min={0}
                    onChange={(e) => setForm((p) => ({ ...p, actualWeight: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Charge Weight (kg)</label>
                  <input type="number" value={form.chargeWeight} min={0}
                    onChange={(e) => setForm((p) => ({ ...p, chargeWeight: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Invoice Details */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Invoice Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Invoice Number</label>
                <input value={form.invoiceNo} onChange={(e) => setForm((p) => ({ ...p, invoiceNo: e.target.value }))}
                  placeholder="Invoice No"
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Invoice Date</label>
                <input type="date" value={form.invoiceDate}
                  onChange={(e) => setForm((p) => ({ ...p, invoiceDate: e.target.value }))}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Invoice Value (₹)</label>
                <input value={form.invoiceValue} onChange={(e) => setForm((p) => ({ ...p, invoiceValue: e.target.value }))}
                  placeholder="0"
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Payment Mode</label>
                <select value={form.paymentMode} onChange={(e) => setForm((p) => ({ ...p, paymentMode: e.target.value as any }))}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="toPay">To Pay</option>
                  <option value="paid">Paid</option>
                  <option value="tBB">To Be Billed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 7: Charges */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Charges</h2>
            <div className="space-y-2.5">
              {[
                { key: 'freight', label: 'Freight (₹)' },
                { key: 'hamali', label: 'Hamali (₹)' },
                { key: 'docket', label: 'Docket Charges (₹)' },
                { key: 'doorCollection', label: 'Door Collection (₹)' },
                { key: 'other', label: 'Other Charges (₹)' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 w-40 flex-shrink-0">{label}</label>
                  <input
                    type="number"
                    value={form.charges[key as keyof typeof emptyCharges]}
                    min={0}
                    onChange={(e) => updateCharge(key as keyof typeof emptyCharges, parseFloat(e.target.value) || 0)}
                    className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-200 mt-2">
                <span className="text-sm font-bold text-gray-900 w-40 flex-shrink-0">Total Freight</span>
                <div className="flex-1 text-right text-xl font-bold text-blue-700">
                  ₹{form.totalFreight.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="text-xs text-gray-500 font-medium">Notes (Optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={2} placeholder="Any special instructions..."
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        {/* Sticky Bottom Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 z-50 lg:static lg:bg-transparent lg:border-0 lg:px-6 lg:pb-6 lg:mt-0">
          <button onClick={() => setView('list')} className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={() => handleSave(false)} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-200">
            <Save className="w-4 h-4" /> Save Booking
          </button>
          <button onClick={() => handleSave(true)} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-200">
            <FileText className="w-4 h-4" /> Save & Invoice
          </button>
        </div>
      </div>
    );
  }

  // =================== LIST VIEW ===================
  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bookings</h1>
          <p className="text-xs text-gray-500">{filtered.length} records</p>
        </div>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-200 transition"
        >
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
        </select>
        <select value={payFilter} onChange={(e) => setPayFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">All Payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Way Bill No', 'Date', 'Route', 'Consignor', 'Consignee', 'Material', 'Freight', 'Status', 'Payment', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => { setViewId(b.id); setView('detail'); }}
                        className="font-bold text-blue-700 hover:text-blue-800">{b.wayBillNo}</button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{format(parseISO(b.bookingDate), 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <span className="text-gray-600">{b.origin}</span> → <span className="text-gray-600">{b.destination}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium max-w-[120px] truncate">{b.consignorName}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[120px] truncate">{b.consigneeName}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[100px] truncate">{b.material}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">₹{b.totalFreight.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize whitespace-nowrap ${statusBadge(b.status)}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${payBadge(b.paymentStatus)}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setViewId(b.id); setView('detail'); }} title="View" className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(b)} title="Edit" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onNavigate('invoice', { bookingId: b.id })} title="Invoice" className="p-1.5 hover:bg-indigo-100 rounded-lg text-indigo-600 transition"><FileText className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(b.id)} title="Delete" className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No bookings found
          </div>
        ) : (
          filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <button onClick={() => { setViewId(b.id); setView('detail'); }} className="font-bold text-blue-700 text-sm">{b.wayBillNo}</button>
                <div className="flex gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(b.status)}`}>{b.status.replace('_', ' ')}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payBadge(b.paymentStatus)}`}>{b.paymentStatus}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-1">{format(parseISO(b.bookingDate), 'dd MMM yyyy')}</div>
              <div className="flex items-center gap-1 text-sm text-gray-700 mb-2">
                <span>{b.origin}</span> <ArrowRight className="w-3 h-3" /> <span>{b.destination}</span>
              </div>
              <div className="text-xs text-gray-600 mb-1">From: <span className="font-medium">{b.consignorName}</span></div>
              <div className="text-xs text-gray-600 mb-3">To: <span className="font-medium">{b.consigneeName}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">₹{b.totalFreight.toLocaleString('en-IN')}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(b)} className="p-2 bg-gray-100 rounded-lg text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onNavigate('invoice', { bookingId: b.id })} className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><FileText className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 bg-red-100 rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
