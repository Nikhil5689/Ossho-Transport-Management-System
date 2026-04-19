import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  TrendingUp, Package, Clock, CheckCircle2, AlertCircle,
  Plus, ArrowRight, Truck, IndianRupee, Users, FileText
} from 'lucide-react';
import { format, startOfMonth, isThisMonth, parseISO } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

interface DashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { bookings, payments, clients } = useStore();

  const stats = useMemo(() => {
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = bookings
      .filter((b) => b.paymentStatus !== 'paid')
      .reduce((sum, b) => sum + (b.totalFreight - b.amountPaid), 0);
    const totalBookings = bookings.length;
    const delivered = bookings.filter((b) => b.status === 'delivered').length;
    const active = bookings.filter((b) => b.status !== 'delivered').length;
    const thisMonthRevenue = payments
      .filter((p) => isThisMonth(parseISO(p.createdAt)))
      .reduce((sum, p) => sum + p.amount, 0);

    return { totalRevenue, totalPending, totalBookings, delivered, active, thisMonthRevenue };
  }, [bookings, payments]);

  // Monthly chart data (last 6 months)
  const chartData = useMemo(() => {
    const months: { [key: string]: { month: string; revenue: number; bookings: number } } = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = format(d, 'MMM yyyy');
      months[key] = { month: format(d, 'MMM'), revenue: 0, bookings: 0 };
    }
    payments.forEach((p) => {
      const key = format(parseISO(p.createdAt), 'MMM yyyy');
      if (months[key]) months[key].revenue += p.amount;
    });
    bookings.forEach((b) => {
      const key = format(parseISO(b.createdAt), 'MMM yyyy');
      if (months[key]) months[key].bookings += 1;
    });
    return Object.values(months);
  }, [bookings, payments]);

  const recentBookings = bookings.slice(0, 8);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      sub: `₹${stats.thisMonthRevenue.toLocaleString('en-IN')} this month`,
      icon: IndianRupee,
      color: 'bg-green-500',
      bg: 'bg-green-50',
      text: 'text-green-700',
    },
    {
      title: 'Pending Dues',
      value: `₹${stats.totalPending.toLocaleString('en-IN')}`,
      sub: `${bookings.filter((b) => b.paymentStatus !== 'paid').length} invoices pending`,
      icon: AlertCircle,
      color: 'bg-orange-500',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings.toString(),
      sub: `${stats.active} active shipments`,
      icon: Package,
      color: 'bg-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    },
    {
      title: 'Delivered',
      value: stats.delivered.toString(),
      sub: `${clients.length} total clients`,
      icon: CheckCircle2,
      color: 'bg-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
    },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'delivered') return 'bg-green-100 text-green-700';
    if (status === 'in_transit') return 'bg-blue-100 text-blue-700';
    return 'bg-orange-100 text-orange-700';
  };

  const getPayStatusColor = (status: string) => {
    if (status === 'paid') return 'bg-green-100 text-green-700';
    if (status === 'partial') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <button
          onClick={() => onNavigate('bookings', { action: 'new' })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Booking</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.text}`} />
                </div>
              </div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 mb-0.5">{card.value}</p>
              <p className="text-xs text-gray-500 font-medium">{card.title}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-sm">Monthly Revenue</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-sm">Booking Trend</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [v, 'Bookings']} />
              <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New Booking', icon: Plus, color: 'bg-blue-600', page: 'bookings', params: { action: 'new' } },
          { label: 'View Invoices', icon: FileText, color: 'bg-indigo-600', page: 'invoice', params: {} },
          { label: 'Add Payment', icon: IndianRupee, color: 'bg-green-600', page: 'payments', params: {} },
          { label: 'View Reports', icon: TrendingUp, color: 'bg-purple-600', page: 'reports', params: {} },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => onNavigate(action.page, action.params)}
              className={`${action.color} hover:opacity-90 text-white rounded-xl px-3 py-3 flex items-center gap-2 text-sm font-medium transition-all shadow-sm`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Recent Bookings</h2>
          <button
            onClick={() => onNavigate('bookings')}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Way Bill No', 'Date', 'From → To', 'Consignor', 'Freight', 'Status', 'Payment'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No bookings yet. Create your first booking!
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    onClick={() => onNavigate('bookings', { view: b.id })}
                  >
                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-700">{b.wayBillNo}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{format(parseISO(b.bookingDate), 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700">{b.origin}</span>
                      <span className="text-gray-400 mx-1">→</span>
                      <span className="text-gray-700">{b.destination}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{b.consignorName}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{b.totalFreight.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusColor(b.status)}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getPayStatusColor(b.paymentStatus)}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {recentBookings.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No bookings yet
            </div>
          ) : (
            recentBookings.map((b) => (
              <div
                key={b.id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => onNavigate('bookings', { view: b.id })}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-bold text-blue-700 text-sm">{b.wayBillNo}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPayStatusColor(b.paymentStatus)}`}>
                    {b.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                  <span>{b.origin}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>{b.destination}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{b.consignorName}</span>
                  <span className="text-sm font-bold text-gray-900">₹{b.totalFreight.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
