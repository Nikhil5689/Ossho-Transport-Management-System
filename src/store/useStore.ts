import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BookingStatus = 'pending' | 'in_transit' | 'delivered';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Client {
  id: string;
  name: string;
  gst: string;
  phone: string;
  address: string;
  city: string;
  createdAt: string;
}

export interface Charges {
  freight: number;
  hamali: number;
  docket: number;
  doorCollection: number;
  other: number;
  total: number;
}

export interface Booking {
  id: string;
  wayBillNo: string;
  bookingDate: string;
  origin: string;
  destination: string;
  consignorId: string;
  consignorName: string;
  consignorPhone: string;
  consignorAddress: string;
  consignorGst: string;
  consigneeId: string;
  consigneeName: string;
  consigneePhone: string;
  consigneeAddress: string;
  consigneeGst: string;
  invoiceNo: string;
  invoiceDate: string;
  invoiceValue: string;
  material: string;
  packages: number;
  packingType: string;
  actualWeight: number;
  chargeWeight: number;
  paymentMode: 'toPay' | 'paid' | 'tBB';
  charges: Charges;
  totalFreight: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  notes: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  wayBillNo: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  notes: string;
  createdAt: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  phone2: string;
  gst: string;
  prefix: string;
  startingNumber: number;
  defaultFreight: number;
  defaultHamali: number;
  defaultDocket: number;
  terms: string;
}

interface AppState {
  isAuthenticated: boolean;
  currentUser: string | null;
  clients: Client[];
  bookings: Booking[];
  payments: Payment[];
  settings: CompanySettings;
  sidebarOpen: boolean;

  // Auth
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Bookings
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'wayBillNo'>) => Booking;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  getNextWayBillNo: () => string;

  // Payments
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  // Settings
  updateSettings: (settings: Partial<CompanySettings>) => void;

  // UI
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const defaultSettings: CompanySettings = {
  name: 'OSHO Transport Chhattisgarh',
  address: 'Transport Nagar, Raipur',
  city: 'Raipur',
  state: 'Chhattisgarh',
  phone: '9876543210',
  phone2: '9876543211',
  gst: '22AAAAA0000A1Z5',
  prefix: 'OSHO-',
  startingNumber: 1001,
  defaultFreight: 0,
  defaultHamali: 0,
  defaultDocket: 50,
  terms: 'Goods once booked will not be returned. Company not responsible for leakage or breakage. All disputes subject to Raipur jurisdiction.',
};

// Simple hash for password
const hashPassword = (pwd: string) => btoa(pwd + '_salt_osho_2024');
const ADMIN_HASH = hashPassword('Rishabh5689');

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      clients: [],
      bookings: [],
      payments: [],
      settings: defaultSettings,
      sidebarOpen: false,

      login: (username: string, password: string) => {
        const validUsername = username.toLowerCase() === 'rishabh';
        const validPassword = hashPassword(password) === ADMIN_HASH;
        if (validUsername && validPassword) {
          set({ isAuthenticated: true, currentUser: username });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false, currentUser: null, sidebarOpen: false });
      },

      addClient: (clientData) => {
        const client: Client = {
          ...clientData,
          id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ clients: [client, ...state.clients] }));
        return client;
      },

      updateClient: (id, clientData) => {
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...clientData } : c)),
        }));
      },

      deleteClient: (id) => {
        set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
      },

      getNextWayBillNo: () => {
        const { settings, bookings } = get();
        const existingNumbers = bookings
          .map((b) => {
            const num = parseInt(b.wayBillNo.replace(settings.prefix, ''));
            return isNaN(num) ? 0 : num;
          })
          .filter((n) => n > 0);
        const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : settings.startingNumber - 1;
        return `${settings.prefix}${maxNum + 1}`;
      },

      addBooking: (bookingData) => {
        const wayBillNo = get().getNextWayBillNo();
        const booking: Booking = {
          ...bookingData,
          id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          wayBillNo,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ bookings: [booking, ...state.bookings] }));
        return booking;
      },

      updateBooking: (id, bookingData) => {
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === id ? { ...b, ...bookingData } : b)),
        }));
      },

      deleteBooking: (id) => {
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== id),
          payments: state.payments.filter((p) => p.bookingId !== id),
        }));
      },

      addPayment: (paymentData) => {
        const payment: Payment = {
          ...paymentData,
          id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          const newPayments = [payment, ...state.payments];
          // Update booking payment status
          const booking = state.bookings.find((b) => b.id === paymentData.bookingId);
          if (booking) {
            const totalPaid = newPayments
              .filter((p) => p.bookingId === paymentData.bookingId)
              .reduce((sum, p) => sum + p.amount, 0);
            const payStatus: PaymentStatus =
              totalPaid >= booking.totalFreight ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
            const updatedBookings = state.bookings.map((b) =>
              b.id === paymentData.bookingId
                ? { ...b, amountPaid: totalPaid, paymentStatus: payStatus }
                : b
            );
            return { payments: newPayments, bookings: updatedBookings };
          }
          return { payments: newPayments };
        });
      },

      updatePayment: (id, paymentData) => {
        set((state) => ({
          payments: state.payments.map((p) => (p.id === id ? { ...p, ...paymentData } : p)),
        }));
      },

      deletePayment: (id) => {
        set((state) => ({ payments: state.payments.filter((p) => p.id !== id) }));
      },

      updateSettings: (settingsData) => {
        set((state) => ({ settings: { ...state.settings, ...settingsData } }));
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },
    }),
    {
      name: 'osho-tms-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        clients: state.clients,
        bookings: state.bookings,
        payments: state.payments,
        settings: state.settings,
      }),
    }
  )
);
