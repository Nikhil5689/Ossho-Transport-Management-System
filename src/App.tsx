import React, { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Clients from './pages/Clients';
import Invoice from './pages/Invoice';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Quotation from './pages/Quotation';
import SettingsPage from './pages/SettingsPage';

type Page = 'dashboard' | 'bookings' | 'clients' | 'invoice' | 'payments' | 'reports' | 'quotation' | 'settings';

export default function App() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [pageParams, setPageParams] = useState<any>(null);

  const handleNavigate = useCallback((page: string, params?: any) => {
    setCurrentPage(page as Page);
    setPageParams(params || null);
  }, []);

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '13px', fontWeight: '500' },
          }}
        />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'bookings':
        return <Bookings onNavigate={handleNavigate} initialParams={pageParams} />;
      case 'clients':
        return <Clients onNavigate={handleNavigate} />;
      case 'invoice':
        return <Invoice onNavigate={handleNavigate} initialParams={pageParams} />;
      case 'payments':
        return <Payments onNavigate={handleNavigate} initialParams={pageParams} />;
      case 'reports':
        return <Reports />;
      case 'quotation':
        return <Quotation />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', fontSize: '13px', fontWeight: '500', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
          success: { style: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' } },
          error: { style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' } },
        }}
      />
    </>
  );
}
