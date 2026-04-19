import React, { useState, useRef, useMemo } from 'react';
import { useStore, Booking } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import { Printer, Download, MessageCircle, ArrowLeft, Search, Eye, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface InvoiceProps {
  onNavigate: (page: string, params?: any) => void;
  initialParams?: any;
}

// ---- Single LR Copy Component ----
function LRCopy({ booking, settings, copyLabel }: { booking: Booking; settings: any; copyLabel: string }) {
  const amtInWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (num === 0) return 'Zero';
    const convert = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };
    return convert(Math.floor(num)) + ' Rupees Only';
  };

  const payModeLabel = booking.paymentMode === 'toPay' ? 'TO PAY' : booking.paymentMode === 'paid' ? 'PAID' : 'TO BE BILLED';

  return (
    <div style={{
      border: '2px solid #1e3a5f',
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      width: '100%',
      boxSizing: 'border-box',
      backgroundColor: '#fff',
      pageBreakInside: 'avoid',
    }}>
      {/* HEADER */}
      <div style={{ backgroundColor: '#1e3a5f', color: '#fff', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
            🚛 {settings.name}
          </div>
          <div style={{ fontSize: '8px', marginTop: '2px', opacity: 0.9 }}>
            {settings.address}, {settings.city}, {settings.state}
          </div>
          <div style={{ fontSize: '8px', opacity: 0.9 }}>
            📞 {settings.phone}{settings.phone2 ? ` | ${settings.phone2}` : ''} | GST: {settings.gst}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            backgroundColor: '#fff',
            color: '#1e3a5f',
            padding: '4px 10px',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '11px',
            marginBottom: '3px',
          }}>WAY BILL / LR</div>
          <div style={{ fontSize: '8px', opacity: 0.85, backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '3px' }}>
            {copyLabel}
          </div>
        </div>
      </div>

      {/* LR NUMBER + DATE ROW */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid #1e3a5f', backgroundColor: '#f0f4f8' }}>
        <div style={{ flex: 1, padding: '5px 8px', borderRight: '1px solid #1e3a5f' }}>
          <span style={{ color: '#555', fontWeight: 'bold', fontSize: '8px' }}>LR / Way Bill No.: </span>
          <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e3a5f' }}>{booking.wayBillNo}</span>
        </div>
        <div style={{ flex: 1, padding: '5px 8px', borderRight: '1px solid #1e3a5f' }}>
          <span style={{ color: '#555', fontWeight: 'bold', fontSize: '8px' }}>Date: </span>
          <span style={{ fontWeight: 'bold', fontSize: '10px', color: '#1e3a5f' }}>
            {format(parseISO(booking.bookingDate), 'dd/MM/yyyy')}
          </span>
        </div>
        <div style={{ flex: 1, padding: '5px 8px' }}>
          <span style={{ color: '#555', fontWeight: 'bold', fontSize: '8px' }}>Payment: </span>
          <span style={{
            fontWeight: 'bold',
            fontSize: '10px',
            color: booking.paymentMode === 'toPay' ? '#e65100' : '#1b5e20',
            backgroundColor: booking.paymentMode === 'toPay' ? '#fff3e0' : '#e8f5e9',
            padding: '1px 5px',
            borderRadius: '3px',
          }}>{payModeLabel}</span>
        </div>
      </div>

      {/* FROM / TO */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid #1e3a5f', backgroundColor: '#e8f0fe' }}>
        <div style={{ flex: 1, padding: '4px 8px', borderRight: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '8px' }}>FROM:</span>
          <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#1e3a5f', textTransform: 'uppercase' }}>{booking.origin}</span>
        </div>
        <div style={{ flex: 1, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '8px' }}>TO:</span>
          <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#1e3a5f', textTransform: 'uppercase' }}>{booking.destination}</span>
        </div>
      </div>

      {/* CONSIGNOR / CONSIGNEE */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid #1e3a5f' }}>
        <div style={{ flex: 1, padding: '5px 8px', borderRight: '1px solid #1e3a5f' }}>
          <div style={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '8px', marginBottom: '3px', textTransform: 'uppercase', borderBottom: '1px dashed #aac' }}>
            Consignor (Sender)
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#222', marginBottom: '2px' }}>{booking.consignorName}</div>
          {booking.consignorPhone && <div style={{ fontSize: '8px', color: '#444' }}>Ph: {booking.consignorPhone}</div>}
          {booking.consignorAddress && <div style={{ fontSize: '8px', color: '#555' }}>{booking.consignorAddress}</div>}
          {booking.consignorGst && <div style={{ fontSize: '8px', color: '#555' }}>GST: {booking.consignorGst}</div>}
        </div>
        <div style={{ flex: 1, padding: '5px 8px' }}>
          <div style={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '8px', marginBottom: '3px', textTransform: 'uppercase', borderBottom: '1px dashed #aac' }}>
            Consignee (Receiver)
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#222', marginBottom: '2px' }}>{booking.consigneeName}</div>
          {booking.consigneePhone && <div style={{ fontSize: '8px', color: '#444' }}>Ph: {booking.consigneePhone}</div>}
          {booking.consigneeAddress && <div style={{ fontSize: '8px', color: '#555' }}>{booking.consigneeAddress}</div>}
          {booking.consigneeGst && <div style={{ fontSize: '8px', color: '#555' }}>GST: {booking.consigneeGst}</div>}
        </div>
      </div>

      {/* SHIPMENT + CHARGES */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid #1e3a5f' }}>
        {/* Shipment Details */}
        <div style={{ flex: 3, borderRight: '1px solid #1e3a5f' }}>
          {/* Table header */}
          <div style={{ display: 'flex', backgroundColor: '#1e3a5f', color: '#fff', fontWeight: 'bold', fontSize: '8px' }}>
            <div style={{ flex: 1.5, padding: '3px 5px', borderRight: '1px solid #fff3' }}>Description</div>
            <div style={{ flex: 1, padding: '3px 5px', borderRight: '1px solid #fff3', textAlign: 'center' }}>Pkgs</div>
            <div style={{ flex: 1, padding: '3px 5px', borderRight: '1px solid #fff3', textAlign: 'center' }}>Packing</div>
            <div style={{ flex: 1, padding: '3px 5px', borderRight: '1px solid #fff3', textAlign: 'center' }}>Act. Wt.</div>
            <div style={{ flex: 1, padding: '3px 5px', textAlign: 'center' }}>Ch. Wt.</div>
          </div>
          {/* Table row */}
          <div style={{ display: 'flex', fontSize: '9px', minHeight: '28px', alignItems: 'center' }}>
            <div style={{ flex: 1.5, padding: '4px 5px', borderRight: '1px solid #ddd', fontWeight: 'bold', color: '#222' }}>{booking.material}</div>
            <div style={{ flex: 1, padding: '4px 5px', borderRight: '1px solid #ddd', textAlign: 'center' }}>{booking.packages}</div>
            <div style={{ flex: 1, padding: '4px 5px', borderRight: '1px solid #ddd', textAlign: 'center' }}>{booking.packingType}</div>
            <div style={{ flex: 1, padding: '4px 5px', borderRight: '1px solid #ddd', textAlign: 'center' }}>{booking.actualWeight} kg</div>
            <div style={{ flex: 1, padding: '4px 5px', textAlign: 'center', fontWeight: 'bold' }}>{booking.chargeWeight} kg</div>
          </div>

          {/* Invoice info */}
          {(booking.invoiceNo || booking.invoiceValue) && (
            <div style={{ display: 'flex', borderTop: '1px solid #ddd', backgroundColor: '#fafafa', padding: '3px 5px', fontSize: '8px', gap: '10px' }}>
              {booking.invoiceNo && <span><b>Inv No:</b> {booking.invoiceNo}</span>}
              {booking.invoiceDate && <span><b>Inv Date:</b> {format(parseISO(booking.invoiceDate), 'dd/MM/yyyy')}</span>}
              {booking.invoiceValue && <span><b>Inv Value:</b> ₹{booking.invoiceValue}</span>}
            </div>
          )}
        </div>

        {/* Charges */}
        <div style={{ flex: 2, fontSize: '9px' }}>
          <div style={{ backgroundColor: '#1e3a5f', color: '#fff', fontWeight: 'bold', fontSize: '8px', padding: '3px 5px', textAlign: 'center' }}>
            CHARGES
          </div>
          {[
            { label: 'Freight', val: booking.charges.freight },
            { label: 'Hamali', val: booking.charges.hamali },
            { label: 'Docket Charges', val: booking.charges.docket },
            { label: 'Door Collection', val: booking.charges.doorCollection },
            { label: 'Other Charges', val: booking.charges.other },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2.5px 6px', borderBottom: '1px solid #eee' }}>
              <span style={{ color: '#444' }}>{c.label}</span>
              <span style={{ fontWeight: c.val > 0 ? 'bold' : 'normal', color: c.val > 0 ? '#222' : '#aaa' }}>
                {c.val > 0 ? `₹ ${c.val.toLocaleString('en-IN')}` : '-'}
              </span>
            </div>
          ))}
          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', backgroundColor: '#1e3a5f', color: '#fff', fontWeight: 'bold' }}>
            <span style={{ fontSize: '8px' }}>TOTAL FREIGHT</span>
            <span style={{ fontSize: '11px' }}>₹ {booking.totalFreight.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Amount in words + Ledger Balance */}
      <div style={{ padding: '4px 8px', backgroundColor: '#f8f9ff', borderBottom: '1.5px solid #1e3a5f' }}>
        <div style={{ fontSize: '8px', color: '#333' }}>
          <b>Amount in Words:</b> {amtInWords(booking.totalFreight)}
        </div>
        {/* LEDGER BALANCE ROW */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '4px',
          padding: '4px 6px',
          backgroundColor: '#e8f0fe',
          border: '1px solid #c5cae9',
          borderRadius: '3px',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#1e3a5f', flex: 1 }}>
            <span>Client: </span><span style={{ textTransform: 'capitalize' }}>{booking.consignorName}</span>
          </div>
          <div style={{ fontSize: '8px', flex: 1 }}>
            <span style={{ color: '#555' }}>Total Freight: </span>
            <span style={{ fontWeight: 'bold', color: '#1e3a5f' }}>₹{booking.totalFreight.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ fontSize: '8px', flex: 1 }}>
            <span style={{ color: '#555' }}>Amount Paid: </span>
            <span style={{ fontWeight: 'bold', color: '#1b5e20' }}>₹{booking.amountPaid.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ fontSize: '8px', flex: 1 }}>
            <span style={{ color: '#555' }}>Balance Due: </span>
            <span style={{ fontWeight: 'bold', color: (booking.totalFreight - booking.amountPaid) > 0 ? '#c62828' : '#1b5e20' }}>
              ₹{(booking.totalFreight - booking.amountPaid).toLocaleString('en-IN')}
            </span>
          </div>
          <div style={{ fontSize: '8px' }}>
            <span style={{
              fontWeight: 'bold',
              padding: '1px 5px',
              borderRadius: '3px',
              backgroundColor: booking.paymentStatus === 'paid' ? '#e8f5e9' : booking.paymentStatus === 'partial' ? '#fff8e1' : '#ffebee',
              color: booking.paymentStatus === 'paid' ? '#1b5e20' : booking.paymentStatus === 'partial' ? '#e65100' : '#c62828',
            }}>
              {booking.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* TERMS + SIGNATURE */}
      <div style={{ display: 'flex', padding: '4px 8px', gap: '8px', minHeight: '32px' }}>
        <div style={{ flex: 3, fontSize: '7px', color: '#666', lineHeight: '1.4' }}>
          <b style={{ color: '#1e3a5f' }}>Terms & Conditions:</b><br />
          {settings.terms || 'Goods booked at owner\'s risk. Company not responsible for leakage/breakage. Subject to Raipur jurisdiction.'}
        </div>
        <div style={{ flex: 2, textAlign: 'center', borderLeft: '1px dashed #ccc', paddingLeft: '8px' }}>
          <div style={{ fontSize: '7px', color: '#666', marginBottom: '16px' }}>Receiver's Signature & Stamp</div>
          <div style={{ borderTop: '1px solid #999', paddingTop: '2px', fontSize: '7px', color: '#888', fontStyle: 'italic' }}>For {settings.name}</div>
          <div style={{ fontSize: '7px', color: '#888' }}>Authorized Signatory</div>
        </div>
      </div>
    </div>
  );
}

// ---- Invoice List View ----
function InvoiceList({ onNavigate, onSelectBooking }: { onNavigate: (p: string, params?: any) => void; onSelectBooking: (b: Booking) => void }) {
  const { bookings, payments } = useStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    bookings.filter((b) =>
      !search ||
      b.wayBillNo.toLowerCase().includes(search.toLowerCase()) ||
      b.consignorName.toLowerCase().includes(search.toLowerCase()) ||
      b.consigneeName.toLowerCase().includes(search.toLowerCase())
    ), [bookings, search]);

  const getPaymentBadge = (status: string) => {
    const map: Record<string, string> = { unpaid: 'bg-red-100 text-red-700', partial: 'bg-yellow-100 text-yellow-700', paid: 'bg-green-100 text-green-700' };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Invoices / Way Bills</h1>
          <p className="text-xs text-gray-500">{filtered.length} records</p>
        </div>
        <button onClick={() => onNavigate('bookings', { action: 'new' })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-200 transition">
          + New Booking
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Way Bill, Consignor, Consignee..."
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Way Bill No', 'Date', 'Consignor', 'Consignee', 'Route', 'Freight', 'Paid', 'Balance', 'Payment Status', 'Action'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-16 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No invoices found
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const balance = b.totalFreight - b.amountPaid;
                return (
                  <tr key={b.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-blue-700">{b.wayBillNo}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {format(parseISO(b.bookingDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[120px] truncate">{b.consignorName}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{b.consigneeName}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{b.origin} → {b.destination}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{b.totalFreight.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-green-700 font-semibold">₹{b.amountPaid.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: balance > 0 ? '#c62828' : '#1b5e20' }}>
                      ₹{balance.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getPaymentBadge(b.paymentStatus)}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => onSelectBooking(b)}
                        className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition font-medium">
                        <Eye className="w-3.5 h-3.5" /> View Invoice
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Ledger Summary Footer */}
          {filtered.length > 0 && (
            <tfoot className="bg-blue-900 text-white">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-xs font-bold uppercase tracking-wide">Ledger Summary — All Invoices</td>
                <td className="px-4 py-3 font-bold text-sm">
                  ₹{filtered.reduce((s, b) => s + b.totalFreight, 0).toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3 font-bold text-sm text-green-300">
                  ₹{filtered.reduce((s, b) => s + b.amountPaid, 0).toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3 font-bold text-sm text-red-300">
                  ₹{filtered.reduce((s, b) => s + (b.totalFreight - b.amountPaid), 0).toLocaleString('en-IN')}
                </td>
                <td colSpan={2} className="px-4 py-3 text-xs text-blue-200">
                  {filtered.filter((b) => b.paymentStatus === 'paid').length} Paid |{' '}
                  {filtered.filter((b) => b.paymentStatus === 'partial').length} Partial |{' '}
                  {filtered.filter((b) => b.paymentStatus === 'unpaid').length} Unpaid
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No invoices found
          </div>
        ) : (
          filtered.map((b) => {
            const balance = b.totalFreight - b.amountPaid;
            return (
              <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-bold text-blue-700">{b.wayBillNo}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPaymentBadge(b.paymentStatus)}`}>
                    {b.paymentStatus}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-1">{format(parseISO(b.bookingDate), 'dd MMM yyyy')} | {b.origin} → {b.destination}</div>
                <div className="text-xs text-gray-700 mb-2">
                  From: <span className="font-medium">{b.consignorName}</span> → To: <span className="font-medium">{b.consigneeName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400">Freight</p>
                    <p className="font-bold text-gray-900">₹{b.totalFreight.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-gray-400">Paid</p>
                    <p className="font-bold text-green-700">₹{b.amountPaid.toLocaleString('en-IN')}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${balance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className="text-gray-400">Balance</p>
                    <p className={`font-bold ${balance > 0 ? 'text-red-700' : 'text-green-700'}`}>₹{balance.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <button onClick={() => onSelectBooking(b)}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm py-2 rounded-xl hover:bg-indigo-700 transition font-medium">
                  <Eye className="w-4 h-4" /> View / Print Invoice
                </button>
              </div>
            );
          })
        )}
        {/* Mobile Ledger Footer */}
        {filtered.length > 0 && (
          <div className="bg-blue-900 text-white rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-wide mb-3">Ledger Summary</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-blue-300">Total</p>
                <p className="font-bold text-sm">₹{filtered.reduce((s, b) => s + b.totalFreight, 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-blue-300">Paid</p>
                <p className="font-bold text-sm text-green-300">₹{filtered.reduce((s, b) => s + b.amountPaid, 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-blue-300">Balance</p>
                <p className="font-bold text-sm text-red-300">₹{filtered.reduce((s, b) => s + (b.totalFreight - b.amountPaid), 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Main Invoice Page ----
export default function Invoice({ onNavigate, initialParams }: InvoiceProps) {
  const { bookings, settings } = useStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // If initialParams has a bookingId, auto-select that booking
  React.useEffect(() => {
    if (initialParams?.bookingId) {
      const booking = bookings.find((b) => b.id === initialParams.bookingId);
      if (booking) setSelectedBooking(booking);
    }
  }, [initialParams, bookings]);

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) { toast.error('Please allow popups to print'); return; }
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Way Bill - ${selectedBooking?.wayBillNo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #fff; }
    @page { size: A4 portrait; margin: 8mm; }
    .lr-copy { page-break-inside: avoid; }
    .divider { border-top: 2px dashed #666; margin: 4px 0; }
  </style>
</head>
<body>${printContents}</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
    toast.success('Print dialog opened');
  };

  const handleWhatsApp = () => {
    if (!selectedBooking) return;
    const msg = encodeURIComponent(
      `Hello ${selectedBooking.consigneeName},\n\nYour shipment is booked with OSHO Transport Chhattisgarh.\n\n📋 Way Bill No: ${selectedBooking.wayBillNo}\n📦 From: ${selectedBooking.origin} → To: ${selectedBooking.destination}\n🎁 Material: ${selectedBooking.material}\n💰 Freight: ₹${selectedBooking.totalFreight.toLocaleString('en-IN')}\n\nFor queries: ${settings.phone}\n\nThank you for choosing OSHO Transport!`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  // Show invoice preview
  if (selectedBooking) {
    return (
      <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button onClick={() => setSelectedBooking(null)} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 text-sm px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          <div className="flex-1" />
          <button onClick={handleWhatsApp}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-blue-200">
            <Printer className="w-4 h-4" /> Print (3 Copies)
          </button>
          <button onClick={() => onNavigate('payments', { bookingId: selectedBooking.id })}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
            + Add Payment
          </button>
        </div>

        <div className="bg-gray-100 rounded-xl p-2">
          <p className="text-xs text-gray-500 text-center mb-2">📄 A4 Print Preview — 3 Identical Copies</p>

          {/* Print Area */}
          <div ref={printRef} style={{ backgroundColor: '#fff', padding: '8px' }}>
            {/* Copy 1 */}
            <div className="lr-copy">
              <LRCopy booking={selectedBooking} settings={settings} copyLabel="CONSIGNOR COPY" />
            </div>
            <div className="divider" style={{ borderTop: '2px dashed #999', margin: '6px 0', textAlign: 'center', fontSize: '8px', color: '#999', position: 'relative' }}>
              <span style={{ backgroundColor: '#f3f4f6', padding: '0 6px', position: 'relative', top: '-7px' }}>✂ CUT HERE</span>
            </div>
            {/* Copy 2 */}
            <div className="lr-copy">
              <LRCopy booking={selectedBooking} settings={settings} copyLabel="CONSIGNEE COPY" />
            </div>
            <div className="divider" style={{ borderTop: '2px dashed #999', margin: '6px 0', textAlign: 'center', fontSize: '8px', color: '#999', position: 'relative' }}>
              <span style={{ backgroundColor: '#f3f4f6', padding: '0 6px', position: 'relative', top: '-7px' }}>✂ CUT HERE</span>
            </div>
            {/* Copy 3 */}
            <div className="lr-copy">
              <LRCopy booking={selectedBooking} settings={settings} copyLabel="OFFICE COPY" />
            </div>
          </div>
        </div>

        {/* Info below */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Invoice Summary — {selectedBooking.wayBillNo}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Total Freight</p>
              <p className="font-bold text-gray-900 text-lg">₹{selectedBooking.totalFreight.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Amount Paid</p>
              <p className="font-bold text-green-700 text-lg">₹{selectedBooking.amountPaid.toLocaleString('en-IN')}</p>
            </div>
            <div className={`rounded-xl p-3 ${(selectedBooking.totalFreight - selectedBooking.amountPaid) > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className="text-xs text-gray-400">Balance Due</p>
              <p className={`font-bold text-lg ${(selectedBooking.totalFreight - selectedBooking.amountPaid) > 0 ? 'text-red-700' : 'text-green-700'}`}>
                ₹{(selectedBooking.totalFreight - selectedBooking.amountPaid).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Client (Consignor)</p>
              <p className="font-bold text-blue-700 text-sm truncate">{selectedBooking.consignorName}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show list view
  return <InvoiceList onNavigate={onNavigate} onSelectBooking={setSelectedBooking} />;
}
