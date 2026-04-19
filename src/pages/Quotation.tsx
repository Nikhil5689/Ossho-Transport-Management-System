import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { Printer, Plus, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Quotation() {
  const { clients, settings } = useStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    quotationNo: `QT-${Date.now().toString().slice(-5)}`,
    date: format(new Date(), 'yyyy-MM-dd'),
    clientId: '',
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    origin: '',
    destination: '',
    material: '',
    weight: '',
    packages: '',
    rateType: 'per_kg',
    rate: '',
    freight: '',
    hamali: '',
    docket: '50',
    other: '',
    validDays: '7',
    notes: '',
    terms: 'This quotation is valid for the specified number of days from the date of issue. Rates may change based on actual weight and packing. GST extra as applicable.',
  });

  const totalAmt = () => {
    return (parseFloat(form.freight) || 0) + (parseFloat(form.hamali) || 0) + (parseFloat(form.docket) || 0) + (parseFloat(form.other) || 0);
  };

  const selectClient = (id: string) => {
    const c = clients.find((x) => x.id === id);
    if (c) {
      setForm((p) => ({ ...p, clientId: id, clientName: c.name, clientPhone: c.phone, clientAddress: c.address }));
    } else {
      setForm((p) => ({ ...p, clientId: '' }));
    }
  };

  const handlePrint = () => {
    const contents = printRef.current?.innerHTML;
    if (!contents) return;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) { toast.error('Allow popups to print'); return; }
    win.document.write(`<!DOCTYPE html><html><head><title>Quotation - ${form.quotationNo}</title>
<style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family: Arial; background:#fff; }
@page { size: A4; margin: 15mm; }</style></head><body>${contents}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
    toast.success('Print dialog opened');
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quotation Builder</h1>
        <button onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-blue-200">
          <Printer className="w-4 h-4" /> Print Quotation
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quotation Details</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Quotation No</label>
            <input value={form.quotationNo} onChange={(e) => setForm((p) => ({ ...p, quotationNo: e.target.value }))}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Select Client</label>
          <select value={form.clientId} onChange={(e) => selectClient(e.target.value)}
            className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">-- Select or enter manually --</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {!form.clientId && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Client Name</label>
              <input value={form.clientName} onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
                placeholder="Client name"
                className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Phone</label>
              <input value={form.clientPhone} onChange={(e) => setForm((p) => ({ ...p, clientPhone: e.target.value }))}
                placeholder="Phone"
                className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">From (Origin)</label>
            <input value={form.origin} onChange={(e) => setForm((p) => ({ ...p, origin: e.target.value }))}
              placeholder="Origin city"
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">To (Destination)</label>
            <input value={form.destination} onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))}
              placeholder="Destination city"
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Material</label>
            <input value={form.material} onChange={(e) => setForm((p) => ({ ...p, material: e.target.value }))}
              placeholder="Material type"
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Approx. Weight (kg)</label>
            <input value={form.weight} onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
              placeholder="Weight"
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide pt-2 border-t border-gray-100">Charges</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'freight', label: 'Freight (₹)' },
            { key: 'hamali', label: 'Hamali (₹)' },
            { key: 'docket', label: 'Docket (₹)' },
            { key: 'other', label: 'Other (₹)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-600">{label}</label>
              <input type="number" value={form[key as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder="0"
                className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-xl p-3 flex justify-between items-center">
          <span className="font-semibold text-gray-700 text-sm">Total Estimated Freight</span>
          <span className="text-xl font-bold text-blue-700">₹{totalAmt().toLocaleString('en-IN')}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Valid for (days)</label>
            <input type="number" value={form.validDays} onChange={(e) => setForm((p) => ({ ...p, validDays: e.target.value }))}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            rows={2} placeholder="Additional notes..."
            className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
      </div>

      {/* Print Preview */}
      <div className="bg-gray-100 rounded-xl p-3">
        <p className="text-xs text-gray-500 text-center mb-3">Quotation Preview</p>
        <div ref={printRef} style={{ backgroundColor: '#fff', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '2px solid #1e3a5f', paddingBottom: '15px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f' }}>🚛 {settings.name}</div>
              <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>{settings.address}, {settings.city}, {settings.state}</div>
              <div style={{ fontSize: '11px', color: '#555' }}>Ph: {settings.phone} | GST: {settings.gst}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ backgroundColor: '#1e3a5f', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                QUOTATION
              </div>
              <div style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>No: {form.quotationNo}</div>
              <div style={{ fontSize: '11px', color: '#555' }}>Date: {form.date ? format(new Date(form.date + 'T00:00:00'), 'dd/MM/yyyy') : ''}</div>
            </div>
          </div>

          {/* To */}
          {(form.clientName || form.clientId) && (
            <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: '#f8f9ff', borderLeft: '3px solid #1e3a5f', borderRadius: '4px' }}>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', marginBottom: '4px' }}>TO:</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#222' }}>{form.clientName}</div>
              {form.clientPhone && <div style={{ fontSize: '11px', color: '#555' }}>Ph: {form.clientPhone}</div>}
              {form.clientAddress && <div style={{ fontSize: '11px', color: '#555' }}>{form.clientAddress}</div>}
            </div>
          )}

          {/* Route & Material */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold', marginBottom: '4px' }}>ROUTE</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a5f' }}>{form.origin || '—'} → {form.destination || '—'}</div>
            </div>
            <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold', marginBottom: '4px' }}>MATERIAL</div>
              <div style={{ fontSize: '12px', color: '#333' }}>{form.material || '—'}</div>
              {form.weight && <div style={{ fontSize: '11px', color: '#666' }}>Weight: ~{form.weight} kg</div>}
            </div>
          </div>

          {/* Charges Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e3a5f', color: '#fff' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px' }}>Particulars</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Freight Charges', val: form.freight },
                { label: 'Hamali Charges', val: form.hamali },
                { label: 'Docket Charges', val: form.docket },
                { label: 'Other Charges', val: form.other },
              ].filter((r) => parseFloat(r.val) > 0).map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee', backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '7px 12px', fontSize: '11px', color: '#333' }}>{r.label}</td>
                  <td style={{ padding: '7px 12px', fontSize: '11px', textAlign: 'right', color: '#333' }}>₹ {Number(r.val).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#1e3a5f', color: '#fff', fontWeight: 'bold' }}>
                <td style={{ padding: '10px 12px', fontSize: '13px' }}>TOTAL ESTIMATED FREIGHT</td>
                <td style={{ padding: '10px 12px', fontSize: '15px', textAlign: 'right' }}>₹ {totalAmt().toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {form.notes && (
            <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: '#fff8e1', borderRadius: '4px', border: '1px solid #ffe082' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#e65100', marginBottom: '4px' }}>NOTES:</div>
              <div style={{ fontSize: '11px', color: '#555' }}>{form.notes}</div>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid #ddd', paddingTop: '12px' }}>
            <div style={{ fontSize: '10px', color: '#666', maxWidth: '60%', lineHeight: '1.5' }}>
              <b>Terms & Conditions:</b><br />{form.terms}
              <br /><b style={{ color: '#1e3a5f' }}>Valid for {form.validDays} days from issue date.</b>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '35px', borderBottom: '1px solid #999', width: '120px', marginBottom: '4px' }}></div>
              <div style={{ fontSize: '10px', color: '#555' }}>For {settings.name}</div>
              <div style={{ fontSize: '10px', color: '#888' }}>Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
