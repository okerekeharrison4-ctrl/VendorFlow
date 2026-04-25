import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Invoice, Currency, CURRENCIES, BankDetails, Client, CatalogItem, TemplateConfig, RecurringInvoice, TaxConfig } from '../types';
import { generateId, generateInvoiceNumber } from '../utils/helpers';
import { auth, db, handleFirestoreError, OperationType, logAppEvent } from '../services/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

type StoreContextType = {
  currentUser: User | null;
  invoices: Invoice[];
  clients: Client[];
  catalog: CatalogItem[];
  currency: Currency;
  hasCompletedOnboarding: boolean;
  bankDetails: BankDetails | null;
  brandName: string;
  vendorTaxId: string;
  templateConfig: TemplateConfig;
  taxConfig: TaxConfig;
  lastSyncedAt: number | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
  isPaletteOpen: boolean;
  isPremium: boolean;
  logoUrl: string | null;
  recurringInvoices: RecurringInvoice[];
  setIsPremium: (isPremium: boolean) => void;
  setLogoUrl: (url: string | null) => void;
  addRecurringInvoice: (invoice: RecurringInvoice) => void;
  updateRecurringInvoice: (invoice: RecurringInvoice) => void;
  deleteRecurringInvoice: (id: string) => void;
  setCurrency: (currency: Currency) => void;
  setBankDetails: (details: BankDetails | null) => void;
  setBrandName: (name: string) => void;
  setVendorTaxId: (id: string) => void;
  setTemplateConfig: (config: TemplateConfig) => void;
  setTaxConfig: (config: TaxConfig) => void;
  toggleTheme: () => void;
  togglePalette: () => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  markAsPaid: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addCatalogItem: (item: CatalogItem) => void;
  updateCatalogItem: (item: CatalogItem) => void;
  deleteCatalogItem: (id: string) => void;
  completeOnboarding: () => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [templateConfig, setTemplateConfigState] = useState<TemplateConfig>({ color: '#2A7A3E', style: 'modern' });
  const [taxConfig, setTaxConfigState] = useState<TaxConfig>({ enabled: false, rate: 7.5, label: 'VAT' });
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]);
  const [bankDetails, setBankDetailsState] = useState<BankDetails | null>(null);
  const [brandName, setBrandNameState] = useState<string>('');
  const [vendorTaxId, setVendorTaxIdState] = useState<string>('');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isPremium, setIsPremiumState] = useState<boolean>(false);
  const [logoUrl, setLogoUrlState] = useState<string | null>(null);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  const addRecurringInvoice = (invoice: RecurringInvoice) => setRecurringInvoices(prev => [invoice, ...prev]);
  const updateRecurringInvoice = (invoice: RecurringInvoice) => setRecurringInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
  const deleteRecurringInvoice = (id: string) => setRecurringInvoices(prev => prev.filter(i => i.id !== id));
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const togglePalette = () => setIsPaletteOpen(prev => !prev);

  // Firebase Auth and Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        let unsubscribeInvoices: (() => void) | null = null;
        let unsubscribeClients: (() => void) | null = null;
        let unsubscribeCatalog: (() => void) | null = null;
        let unsubscribeProfile: (() => void) | null = null;

        unsubscribeInvoices = onSnapshot(collection(db, 'users', user.uid, 'invoices'), (snapshot) => {
          const fetchedInvoices = snapshot.docs.map(doc => doc.data() as Invoice);
          setInvoices(fetchedInvoices);
        }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/invoices`));

        unsubscribeClients = onSnapshot(collection(db, 'users', user.uid, 'clients'), (snapshot) => {
          const fetchedClients = snapshot.docs.map(doc => doc.data() as Client);
          setClients(fetchedClients);
        }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/clients`));

        unsubscribeCatalog = onSnapshot(collection(db, 'users', user.uid, 'catalog'), (snapshot) => {
          const fetchedCatalog = snapshot.docs.map(doc => doc.data() as CatalogItem);
          setCatalog(fetchedCatalog);
        }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/catalog`));

        unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
             const data = docSnap.data();
             if (data.brandName) setBrandNameState(data.brandName);
             if (data.currency) setCurrencyState(data.currency as Currency);
             if (data.vendorTaxId) setVendorTaxIdState(data.vendorTaxId);
             if (data.isPremium !== undefined) setIsPremiumState(data.isPremium);
             if (data.logoUrl) setLogoUrlState(data.logoUrl);
             if (data.hasCompletedOnboarding !== undefined) setHasCompletedOnboarding(data.hasCompletedOnboarding);
          } else {
             setDoc(doc(db, 'users', user.uid), {
               uid: user.uid,
               email: user.email || '',
               createdAt: Date.now(),
               updatedAt: Date.now()
             }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}`));
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

        return () => {
          if (unsubscribeInvoices) unsubscribeInvoices();
          if (unsubscribeClients) unsubscribeClients();
          if (unsubscribeCatalog) unsubscribeCatalog();
          if (unsubscribeProfile) unsubscribeProfile();
        };
      } else {
        // Clear sensitive info on sign out to prevent inspect console leaks
        setInvoices([]);
        setClients([]);
        setCatalog([]);
        setBrandNameState('');
        setVendorTaxIdState('');
        setBankDetailsState(null);
        setIsPremiumState(false);
        setLogoUrlState(null);
        setRecurringInvoices([]);
        // Clear completely from localStorage hack-proofing
        localStorage.clear();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    async function loadData() {
      // Load non-sensitive preferences from localStorage only
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
      setThemeState(savedTheme);
      if (localStorage.getItem('vendorflow_onboarding_completed') === 'true') {
        setHasCompletedOnboarding(true);
      }
      setIsLoading(false);
      
      // Cleanup legacy encrypted data that might be leaking sensitive info
      localStorage.removeItem('vendorflow-encryption-key');
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('vendorflow-data-')) {
          localStorage.removeItem(key);
        }
      }
    }
    loadData();
  }, []);

  const toggleTheme = () => {
    setThemeState(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    if (isLoading) return;
    const now = Date.now();
    recurringInvoices.forEach(recurring => {
      if (recurring.isActive && recurring.nextRun <= now) {
        const newInvoice: Invoice = {
          id: generateId(),
          invoiceNumber: generateInvoiceNumber(),
          customerName: recurring.customerId,
          items: recurring.items,
          createdAt: now,
          updatedAt: now,
          status: 'unpaid',
        };
        addInvoice(newInvoice);
        
        const nextRun = new Date(recurring.nextRun);
        if (recurring.frequency === 'daily') nextRun.setDate(nextRun.getDate() + 1);
        else if (recurring.frequency === 'weekly') nextRun.setDate(nextRun.getDate() + 7);
        else if (recurring.frequency === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1);
        
        updateRecurringInvoice({ ...recurring, nextRun: nextRun.getTime() });
      }
    });
  }, [recurringInvoices, isLoading]);

  const setIsPremium = async (isPremium: boolean) => {
    setIsPremiumState(isPremium);
    if (currentUser) {
       try {
         await setDoc(doc(db, 'users', currentUser.uid), { isPremium, updatedAt: Date.now(), uid: currentUser.uid, createdAt: Date.now(), email: currentUser.email || '' }, { merge: true });
       } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`);
       }
    }
  };

  const setLogoUrl = async (url: string | null) => {
    setLogoUrlState(url);
    if (currentUser) {
       try {
         await setDoc(doc(db, 'users', currentUser.uid), { logoUrl: url, updatedAt: Date.now(), uid: currentUser.uid, createdAt: Date.now(), email: currentUser.email || '' }, { merge: true });
       } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`);
       }
    }
  };

  const setCurrency = async (curr: Currency) => {
    setCurrencyState(curr);
    if (currentUser) {
       try {
         await setDoc(doc(db, 'users', currentUser.uid), { currency: curr, updatedAt: Date.now(), uid: currentUser.uid, createdAt: Date.now(), email: currentUser.email || '' }, { merge: true });
       } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`);
       }
    }
  };

  const setBankDetails = async (details: BankDetails | null) => {
    setBankDetailsState(details);
    if (currentUser) {
       try {
         await setDoc(doc(db, 'users', currentUser.uid), { bankDetails: details, updatedAt: Date.now(), uid: currentUser.uid, createdAt: Date.now(), email: currentUser.email || '' }, { merge: true });
       } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`);
       }
    }
  };

  const setBrandName = async (name: string) => {
    setBrandNameState(name);
    if (currentUser) {
       try {
         await setDoc(doc(db, 'users', currentUser.uid), { brandName: name, updatedAt: Date.now(), uid: currentUser.uid, createdAt: Date.now(), email: currentUser.email || '' }, { merge: true });
       } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`);
       }
    }
  };

  const setVendorTaxId = async (id: string) => {
    setVendorTaxIdState(id);
    if (currentUser) {
       try {
         await setDoc(doc(db, 'users', currentUser.uid), { vendorTaxId: id, updatedAt: Date.now(), uid: currentUser.uid, createdAt: Date.now(), email: currentUser.email || '' }, { merge: true });
       } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`);
       }
    }
  };

  const setTemplateConfig = async (config: TemplateConfig) => {
    setTemplateConfigState(config);
    if (currentUser) {
       try {
         await setDoc(doc(db, 'users', currentUser.uid), { template: config, updatedAt: Date.now(), uid: currentUser.uid, createdAt: Date.now(), email: currentUser.email || '' }, { merge: true });
       } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`);
       }
    }
  };

  const setTaxConfig = async (config: TaxConfig) => {
    setTaxConfigState(config);
    if (currentUser) {
       try {
         await setDoc(doc(db, 'users', currentUser.uid), { taxConfig: config, updatedAt: Date.now(), uid: currentUser.uid, createdAt: Date.now(), email: currentUser.email || '' }, { merge: true });
       } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`);
       }
    }
  };

  const completeOnboarding = async () => {
    setHasCompletedOnboarding(true);
    localStorage.setItem('vendorflow_onboarding_completed', 'true');
    if (currentUser) {
       try {
         await setDoc(doc(db, 'users', currentUser.uid), { hasCompletedOnboarding: true, updatedAt: Date.now(), uid: currentUser.uid, createdAt: Date.now(), email: currentUser.email || '' }, { merge: true });
         logAppEvent('complete_onboarding');
       } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`);
       }
    }
  };

  const addInvoice = async (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'invoices', invoice.id), { ...invoice, userId: currentUser.uid });
        logAppEvent('create_invoice', { value: invoice.items.reduce((total, item) => total + (item.quantity * item.price), 0), currency: currency.code });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${currentUser.uid}/invoices/${invoice.id}`);
      }
    }
  };

  const updateInvoice = async (invoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'invoices', invoice.id), { ...invoice, userId: currentUser.uid });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}/invoices/${invoice.id}`);
      }
    }
  };

  const deleteInvoice = async (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'invoices', id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `users/${currentUser.uid}/invoices/${id}`);
      }
    }
  };

  const markAsPaid = async (id: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: 'paid', paidAt: Date.now(), updatedAt: Date.now() } : inv
    ));
    if (currentUser) {
      try {
        const invToUpdate = invoices.find(inv => inv.id === id);
        if (invToUpdate) {
            await setDoc(doc(db, 'users', currentUser.uid, 'invoices', id), { ...invToUpdate, status: 'paid', paidAt: Date.now(), updatedAt: Date.now(), userId: currentUser.uid });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}/invoices/${id}`);
      }
    }
  };

  const getInvoice = (id: string) => invoices.find(inv => inv.id === id);

  const addClient = async (client: Client) => {
    setClients(prev => [client, ...prev]);
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'clients', client.id), { ...client, userId: currentUser.uid });
        logAppEvent('create_client');
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${currentUser.uid}/clients/${client.id}`);
      }
    }
  };
  
  const updateClient = async (client: Client) => {
    setClients(prev => prev.map(c => c.id === client.id ? client : c));
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'clients', client.id), { ...client, userId: currentUser.uid });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}/clients/${client.id}`);
      }
    }
  };
  
  const deleteClient = async (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'clients', id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `users/${currentUser.uid}/clients/${id}`);
      }
    }
  };

  const addCatalogItem = async (item: CatalogItem) => {
    setCatalog(prev => [item, ...prev]);
    if (currentUser) {
       try {
         await setDoc(doc(db, 'users', currentUser.uid, 'catalog', item.id), { ...item, userId: currentUser.uid });
       } catch (e) {
         handleFirestoreError(e, OperationType.CREATE, `users/${currentUser.uid}/catalog/${item.id}`);
       }
    }
  };
  
  const updateCatalogItem = async (item: CatalogItem) => {
    setCatalog(prev => prev.map(c => c.id === item.id ? item : c));
    if (currentUser) {
      try {
         await setDoc(doc(db, 'users', currentUser.uid, 'catalog', item.id), { ...item, userId: currentUser.uid });
      } catch (e) {
         handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}/catalog/${item.id}`);
      }
    }
  };
  
  const deleteCatalogItem = async (id: string) => {
    setCatalog(prev => prev.filter(c => c.id !== id));
    if (currentUser) {
       try {
         await deleteDoc(doc(db, 'users', currentUser.uid, 'catalog', id));
       } catch (e) {
         handleFirestoreError(e, OperationType.DELETE, `users/${currentUser.uid}/catalog/${id}`);
       }
    }
  };

  return (
    <StoreContext.Provider value={{
      currentUser, invoices, clients, catalog, currency, hasCompletedOnboarding, bankDetails, brandName, vendorTaxId, templateConfig, taxConfig, lastSyncedAt, isLoading, theme, isPaletteOpen,
      isPremium,
      logoUrl,
      recurringInvoices,
      setIsPremium,
      setLogoUrl,
      addRecurringInvoice,
      updateRecurringInvoice,
      deleteRecurringInvoice,
      setCurrency, setBankDetails, setBrandName, setVendorTaxId, setTemplateConfig, setTaxConfig, toggleTheme, togglePalette,
      addInvoice, updateInvoice, deleteInvoice, markAsPaid, getInvoice,
      addClient, updateClient, deleteClient,
      addCatalogItem, updateCatalogItem, deleteCatalogItem,
      completeOnboarding
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
