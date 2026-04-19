import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Save, Settings, Building2, Hash, FileText, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    toast.success('Settings saved successfully!');
    setTimeout(() => setSaved(false), 3000);
  };

  const f = (key: keyof typeof form, val: string | number) => setForm((p) => ({ ...p, [key]: val }));

  const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4 pb-24 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-xs text-gray-500">Configure your transport company details</p>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg ${saved ? 'bg-green-600 shadow-green-200' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'} text-white`}>
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Company Info */}
      <Section icon={Building2} title="Company Information">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Company Name</label>
            <input value={form.name} onChange={(e) => f('name', e.target.value)}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Primary Phone</label>
              <input value={form.phone} onChange={(e) => f('phone', e.target.value)}
                className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Secondary Phone</label>
              <input value={form.phone2} onChange={(e) => f('phone2', e.target.value)}
                className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">GST Number</label>
            <input value={form.gst} onChange={(e) => f('gst', e.target.value)}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Address</label>
            <input value={form.address} onChange={(e) => f('address', e.target.value)}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">City</label>
              <input value={form.city} onChange={(e) => f('city', e.target.value)}
                className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">State</label>
              <input value={form.state} onChange={(e) => f('state', e.target.value)}
                className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
      </Section>

      {/* Numbering */}
      <Section icon={Hash} title="Way Bill Numbering">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Prefix</label>
            <input value={form.prefix} onChange={(e) => f('prefix', e.target.value)}
              placeholder="e.g. OSHO-"
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-400 mt-1">Example: {form.prefix}1001</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Starting Number</label>
            <input type="number" value={form.startingNumber} onChange={(e) => f('startingNumber', parseInt(e.target.value) || 1001)}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Section>

      {/* Default Charges */}
      <Section icon={Settings} title="Default Charges">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Default Freight (₹)</label>
            <input type="number" value={form.defaultFreight} onChange={(e) => f('defaultFreight', parseFloat(e.target.value) || 0)}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Default Hamali (₹)</label>
            <input type="number" value={form.defaultHamali} onChange={(e) => f('defaultHamali', parseFloat(e.target.value) || 0)}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Default Docket (₹)</label>
            <input type="number" value={form.defaultDocket} onChange={(e) => f('defaultDocket', parseFloat(e.target.value) || 0)}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Section>

      {/* Terms */}
      <Section icon={FileText} title="Default Terms & Conditions">
        <div>
          <label className="text-xs font-medium text-gray-600">Terms (shown on all invoices)</label>
          <textarea value={form.terms} onChange={(e) => f('terms', e.target.value)}
            rows={4} placeholder="Enter terms and conditions..."
            className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
      </Section>

      {/* Login Info */}
      <Section icon={Shield} title="Login Credentials">
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">Current Login Details:</p>
          <p>Username: <span className="font-mono font-bold">Rishabh</span></p>
          <p>Password: <span className="font-mono font-bold">Rishabh5689</span></p>
          <p className="text-xs text-blue-600 mt-2">To change credentials, update the store configuration.</p>
        </div>
      </Section>

      {/* Save Button - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 lg:hidden z-40">
        <button onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-200">
          <Save className="w-4 h-4" /> Save All Settings
        </button>
      </div>
    </div>
  );
}
