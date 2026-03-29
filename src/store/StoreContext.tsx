import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Invoice, Currency, CURRENCIES, BankDetails, Client, CatalogItem, TemplateConfig } from '../types';
import { getEncryptedData, saveEncryptedData } from '../services/storageService';

type StoreContextType = {
  invoices: Invoice[];
  clients: Client[];
  catalog: CatalogItem[];
  currency: Currency;
  hasCompletedOnboarding: boolean;
  bankDetails: BankDetails | null;
  brandName: string;
  templateConfig: TemplateConfig;
  lastSyncedAt: number | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
  isPaletteOpen: boolean;
  setCurrency: (currency: Currency) => void;
  setBankDetails: (details: BankDetails | null) => void;
  setBrandName: (name: string) => void;
  setTemplateConfig: (config: TemplateConfig) => void;
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [templateConfig, setTemplateConfigState] = useState<TemplateConfig>({ color: '#000000', style: 'modern' });
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]);
  const [bankDetails, setBankDetailsState] = useState<BankDetails | null>(null);
  const [brandName, setBrandNameState] = useState<string>('');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const togglePalette = () => setIsPaletteOpen(prev => !prev);

  useEffect(() => {
    async function loadData() {
      const savedInvoices = await getEncryptedData('invoices') || [];
      const savedClients = await getEncryptedData('clients') || [];
      const savedCatalog = await getEncryptedData('catalog') || [];
      const savedTemplate = await getEncryptedData('template') || { color: '#000000', style: 'modern' };
      const savedCurrency = await getEncryptedData('currency') || CURRENCIES[0];
      const savedBankDetails = await getEncryptedData('bank_details') || null;
      const savedBrandName = await getEncryptedData('brand_name') || '';
      const savedOnboarding = await getEncryptedData('onboarding') === 'true';
      const savedTheme = await getEncryptedData('theme') || 'light';

      setInvoices(savedInvoices);
      setClients(savedClients);
      setCatalog(savedCatalog);
      setTemplateConfigState(savedTemplate);
      setCurrencyState(savedCurrency);
      setBankDetailsState(savedBankDetails);
      setBrandNameState(savedBrandName);
      setHasCompletedOnboarding(savedOnboarding);
      setThemeState(savedTheme);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const toggleTheme = () => {
    setThemeState(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  useEffect(() => {
    if (isLoading) return;
    saveEncryptedData('theme', theme);
  }, [theme, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveEncryptedData('invoices', invoices);
  }, [invoices, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveEncryptedData('clients', clients);
  }, [clients, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveEncryptedData('catalog', catalog);
  }, [catalog, isLoading]);

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    saveEncryptedData('currency', curr);
  };

  const setBankDetails = (details: BankDetails | null) => {
    setBankDetailsState(details);
    saveEncryptedData('bank_details', details);
  };

  const setBrandName = (name: string) => {
    setBrandNameState(name);
    saveEncryptedData('brand_name', name);
  };

  const setTemplateConfig = (config: TemplateConfig) => {
    setTemplateConfigState(config);
    saveEncryptedData('template', config);
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    saveEncryptedData('onboarding', 'true');
  };

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  };

  const updateInvoice = (invoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const markAsPaid = (id: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: 'paid', paidAt: Date.now(), updatedAt: Date.now() } : inv
    ));
  };

  const getInvoice = (id: string) => invoices.find(inv => inv.id === id);

  const addClient = (client: Client) => setClients(prev => [client, ...prev]);
  const updateClient = (client: Client) => setClients(prev => prev.map(c => c.id === client.id ? client : c));
  const deleteClient = (id: string) => setClients(prev => prev.filter(c => c.id !== id));

  const addCatalogItem = (item: CatalogItem) => setCatalog(prev => [item, ...prev]);
  const updateCatalogItem = (item: CatalogItem) => setCatalog(prev => prev.map(c => c.id === item.id ? item : c));
  const deleteCatalogItem = (id: string) => setCatalog(prev => prev.filter(c => c.id !== id));

  return (
    <StoreContext.Provider value={{
      invoices, clients, catalog, currency, hasCompletedOnboarding, bankDetails, brandName, templateConfig, lastSyncedAt, isLoading, theme, isPaletteOpen,
      setCurrency, setBankDetails, setBrandName, setTemplateConfig, toggleTheme, togglePalette,
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
