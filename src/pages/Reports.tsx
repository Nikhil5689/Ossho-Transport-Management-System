import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Download, BarChart2, TrendingUp, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export default function Reports() {
  const { bookings, payments, clients } = useStore();
  const [quickFilter, setQuickFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('month');
  const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-01'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [clientFilter, setClientFilter] = useState('all');

  const isInRange = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      if (quickFilter === 'today') return isToday(d);
      if (quickFilter === 'yesterday') return isYesterday(d);
      if (quickFilter === 'week') return isThisWeek(d, { weekStartsOn: 1 });
      if (quickFilter === 'month') return isThisMonth(d);
      if (quickFilter === 'custom') {
        return isWithinInterval(d, { start: startOfDay(parseISO(dateFrom)), end: endOfDay(parseISO(dateTo)) });
      }
      return true;
    } catch { return false; }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const inRange = isInRange(b.bookingDate);
      const matchClient = clientFilter === 'all' || b.consignorId === clientFilter;
      return inRange && matchClient;
    });
  }, [bookings, quickFilter, dateFrom, dateTo, clientFilter]);

  const stats = useMemo(() => {
    const totalFreight = filteredBookings.reduce((s, b) => s + b.totalFreight, 0);
    const totalPaid = filteredBookings.reduce((s, b) => s + b.amountPaid, 0);
    const totalPending = totalFreight - totalPaid;
    const delivered = filteredBookings.filter((b) => b.status === 'delivered').length;
    return { totalFreight, totalPaid, totalPending, delivered, count: filteredBookings.length };
  }, [filteredBookings]);

  // Route-wise stats
  const routeStats = useMemo(() => {
    const map: Record<string, { route: string; count: number; freight: number }> = {};
    filteredBookings.forEach((b) => {
      const key = `${b.origin} → ${b.destination}`;
      if (!map[key]) map[key] = { route: key, count: 0, freight: 0 };
      map[key].count += 1;
      map[key].freight += b.totalFreight;
    });
    return Object.values(map).sort((a, b) => b.freight - a.freight).slice(0, 8);
  }, [filteredBookings]);

  const handleExport = () => {
    const data = filteredBookings.map((b, i) => ({
      'S.No': i + 1,
      'Docket No': b.wayBillNo,
      'Date': format(parseISO(b.bookingDate), 'dd/MM/yyyy'),
      'Consignor (Sender)': b.consignorName,
      'Sender Phone': b.consignorPhone,
      'Consignee (Receiver)': b.consigneeName,
      'Receiver Phone': b.consigneePhone,
      'From': b.origin,
      'To': b.destination,
      'Material': b.material,
      'Packages': b.packages,
      'Packing Type': b.packingType,
      'Actual Weight (kg)': b.actualWeight,
      'Charge Weight (kg)': b.chargeWeight,
      'Freight (₹)': b.charges.freight,
      'Hamali (₹)': b.charges.hamali,
      'Docket Charges (₹)': b.charges.docket,
      'Door Collection (₹)': b.charges.doorCollection,
      'Other Charges (₹)': b.charges.other,
      'Total Freight (₹)': b.totalFreight,
      'Amount Paid (₹)': b.amountPaid,
      'Balance Due (₹)': b.totalFreight - b.amountPaid,
      'Payment Status': b.paymentStatus,
      'Shipment Status': b.status.replace('_', ' '),
      'Invoice No': b.invoiceNo,
      'Invoice Value (₹)': b.invoiceValue,
      'Payment Mode': b.paymentMode,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings Report');

    // Style header
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    ws['!cols'] = Array(range.e.c + 1).fill({ wch: 18 });

    XLSX.writeFile(wb, `OSHO_TMS_Report_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    toast.success('Report exported successfully!');
  };

  const quickFilters = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'custom', label: 'Custom' },
  ] as const;

  const payBadge = (status: string) => {
    const map: Record<string, string> = { unpaid: 'bg-red-100 text-red-700', partial: 'bg-yellow-100 text-yellow-700', paid: 'bg-green-100 text-green-700' };
    return map[status] || '';
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-xs text-gray-500">{filteredBookings.length} records in selected period</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-green-200 transition">
          <FileSpreadsheet className="w-4 h-4" /> Export Excel
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((f) => (
          <button key={f.key} onClick={() => setQuickFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${quickFilter === f.key ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {f.label}
          </button>
        ))}
        {quickFilter === 'custom' && (
          <div className="flex gap-2 flex-wrap">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
        )}
        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto">
          <option value="all">All Clients</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Bookings', value: stats.count, color: 'bg-blue-50 text-blue-700', icon: '📦' },
          { label: 'Total Freight', value: `₹${stats.totalFreight.toLocaleString('en-IN')}`, color: 'bg-gray-50 text-gray-800', icon: '💰' },
          { label: 'Amount Received', value: `₹${stats.totalPaid.toLocaleString('en-IN')}`, color: 'bg-green-50 text-green-700', icon: '✅' },
          { label: 'Pending Dues', value: `₹${stats.totalPending.toLocaleString('en-IN')}`, color: 'bg-red-50 text-red-700', icon: '⚠️' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 border ${s.color === 'bg-blue-50 text-blue-700' ? 'border-blue-100' : s.color === 'bg-green-50 text-green-700' ? 'border-green-100' : s.color === 'bg-red-50 text-red-700' ? 'border-red-100' : 'border-gray-100'} ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Route Performance Chart */}
      {routeStats.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Route-wise Performance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={routeStats} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="route" tick={{ fontSize: 10 }} width={120} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Freight']} />
              <Bar dataKey="freight" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Report Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">Detailed Report</h2>
          <span className="text-xs text-gray-400">{filteredBookings.length} entries</span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'Docket No', 'Date', 'Consignor', 'Phone', 'Material', 'Pkgs', 'Route', 'Freight', 'Paid', 'Balance', 'Payment', 'Status'].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBookings.length === 0 ? (
                <tr><td colSpan={13} className="text-center py-12 text-gray-400">
                  <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No data for selected period
                </td></tr>
              ) : (
                filteredBookings.map((b, i) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-2.5 font-bold text-blue-700">{b.wayBillNo}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap">{format(parseISO(b.bookingDate), 'dd/MM/yyyy')}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800 max-w-[100px] truncate">{b.consignorName}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{b.consignorPhone || '-'}</td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-[100px] truncate">{b.material}</td>
                    <td className="px-3 py-2.5 text-center text-gray-600">{b.packages}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{b.origin} → {b.destination}</td>
                    <td className="px-3 py-2.5 font-semibold text-gray-900">₹{b.totalFreight.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2.5 text-green-700 font-semibold">₹{b.amountPaid.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2.5 font-semibold" style={{ color: (b.totalFreight - b.amountPaid) > 0 ? '#c62828' : '#1b5e20' }}>
                      ₹{(b.totalFreight - b.amountPaid).toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${payBadge(b.paymentStatus)}`}>{b.paymentStatus}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${b.status === 'delivered' ? 'bg-green-100 text-green-700' : b.status === 'in_transit' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredBookings.length > 0 && (
              <tfoot className="bg-blue-900 text-white">
                <tr>
                  <td colSpan={8} className="px-3 py-3 text-xs font-bold uppercase">TOTALS</td>
                  <td className="px-3 py-3 font-bold">₹{stats.totalFreight.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 font-bold text-green-300">₹{stats.totalPaid.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 font-bold text-red-300">₹{stats.totalPending.toLocaleString('en-IN')}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-50">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-10 text-gray-400 p-4">No data for selected period</div>
          ) : (
            filteredBookings.map((b, i) => (
              <div key={b.id} className="p-4">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-blue-700 text-sm">{b.wayBillNo}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payBadge(b.paymentStatus)}`}>{b.paymentStatus}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{format(parseISO(b.bookingDate), 'dd/MM/yyyy')} | {b.origin} → {b.destination}</p>
                <p className="text-xs text-gray-700 mb-2">{b.consignorName} | {b.material}</p>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-900">₹{b.totalFreight.toLocaleString('en-IN')}</span>
                  <span className="text-red-600 font-bold">Due: ₹{(b.totalFreight - b.amountPaid).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
