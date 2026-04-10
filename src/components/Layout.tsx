import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Users, Settings, Plus, ArrowLeft, BarChart3, Package, Users2, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { useStore } from '../store/StoreContext';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { togglePalette, brandName, bankDetails, invoices } = useStore();
  const currentPath = location.pathname;

  const showBottomNav = ['/', '/debts', '/settings', '/clients', '/catalog', '/analytics'].includes(currentPath);
  const showHeader = true;
  const isRoot = ['/', '/debts', '/settings', '/clients', '/catalog', '/analytics'].includes(currentPath);

  const getTitle = () => {
    return 'VendorFlow';
  };

  // Smart Tutorial Gestures Logic
  const needsSettingsSetup = !brandName || !bankDetails;
  const needsFirstInvoice = !needsSettingsSetup && invoices.length === 0;

  const [dismissedSettingsTooltip, setDismissedSettingsTooltip] = useState(false);
  const [dismissedInvoiceTooltip, setDismissedInvoiceTooltip] = useState(false);

  useEffect(() => {
    const sTooltip = localStorage.getItem('dismissed_settings_tooltip');
    const iTooltip = localStorage.getItem('dismissed_invoice_tooltip');
    if (sTooltip) setDismissedSettingsTooltip(true);
    if (iTooltip) setDismissedInvoiceTooltip(true);
  }, []);

  const dismissSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedSettingsTooltip(true);
    localStorage.setItem('dismissed_settings_tooltip', 'true');
  };

  const dismissInvoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedInvoiceTooltip(true);
    localStorage.setItem('dismissed_invoice_tooltip', 'true');
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col md:flex-row pb-32 md:pb-0 relative">
      {/* Sidebar for Desktop */}
      {showBottomNav && (
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-surface-container-lowest z-50">
          <div className="p-6 flex items-center gap-3">
            <Logo size={32} variant="icon" />
            <h1 className="text-xl font-bold text-on-surface tracking-tight">{getTitle()}</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto relative">
            <NavItem icon={<FileText size={22} />} label="Home" isActive={currentPath === '/'} onClick={() => navigate('/')} isDesktop />
            <NavItem icon={<Users size={22} />} label="Invoices" isActive={currentPath === '/debts'} onClick={() => navigate('/debts')} isDesktop />
            <NavItem icon={<Users2 size={22} />} label="Clients" isActive={currentPath === '/clients'} onClick={() => navigate('/clients')} isDesktop />
            <NavItem icon={<Package size={22} />} label="Catalog" isActive={currentPath === '/catalog'} onClick={() => navigate('/catalog')} isDesktop />
            <NavItem icon={<BarChart3 size={22} />} label="Analytics" isActive={currentPath === '/analytics'} onClick={() => navigate('/analytics')} isDesktop />
            
            <div className="relative">
              <NavItem icon={<Settings size={22} />} label="Settings" isActive={currentPath === '/settings'} onClick={() => navigate('/settings')} isDesktop showGuide={needsSettingsSetup} />
              <AnimatePresence>
                {needsSettingsSetup && !dismissedSettingsTooltip && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-primary text-on-primary text-xs font-bold px-4 py-3 rounded-2xl shadow-ambient w-48 z-50"
                  >
                    <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rotate-45" />
                    <p>Start here! Set up your business and payment details.</p>
                    <button onClick={dismissSettings} className="absolute top-1 right-1 p-1 opacity-70 hover:opacity-100">
                      <X size={12} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
          <div className="p-6 space-y-3 relative">
            {!useStore().isPremium && (
              <button 
                onClick={() => window.dispatchEvent(new Event('open_subscription_modal'))}
                className="w-full bg-gradient-to-r from-surface-container-low to-surface-container-high text-primary py-3 rounded-3xl font-bold flex items-center justify-center gap-2 hover:shadow-ambient active:scale-95 transition-all border border-transparent hover:border-primary/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
                Upgrade
              </button>
            )}
            <div className="relative">
              <motion.button 
                onClick={() => navigate('/create')}
                animate={needsFirstInvoice ? { scale: [1, 1.05, 1], boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 20px rgba(var(--color-primary), 0.5)", "0px 0px 0px rgba(0,0,0,0)"] } : {}}
                transition={needsFirstInvoice ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                className="w-full bg-gradient-to-r from-primary to-primary-heavy text-on-primary py-3 rounded-3xl font-bold shadow-ambient flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all relative"
              >
                {needsFirstInvoice && (
                  <motion.span 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <Plus size={20} />
                New Invoice
              </motion.button>
              <AnimatePresence>
                {needsFirstInvoice && !dismissedInvoiceTooltip && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-primary text-on-primary text-xs font-bold px-4 py-3 rounded-2xl shadow-ambient w-48 z-50"
                  >
                    <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rotate-45" />
                    <p>You're all set! Create your first invoice here.</p>
                    <button onClick={dismissInvoice} className="absolute top-1 right-1 p-1 opacity-70 hover:opacity-100">
                      <X size={12} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {showHeader && (
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md md:hidden">
            <div className="w-full flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-4">
                {!isRoot ? (
                  <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low active:scale-95 transition-all text-on-surface">
                    <ArrowLeft size={24} />
                  </button>
                ) : (
                  <Logo size={32} variant="icon" />
                )}
                <h1 className="text-xl font-bold text-on-surface tracking-tight">
                  {getTitle()}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {!useStore().isPremium && isRoot && (
                  <button 
                    onClick={() => window.dispatchEvent(new Event('open_subscription_modal'))}
                    className="px-3 py-1.5 bg-gradient-to-r from-surface-container-low to-surface-container-high text-primary rounded-full font-bold text-xs active:scale-95 transition-transform hover:shadow-ambient"
                  >
                    Upgrade
                  </button>
                )}
                <button onClick={togglePalette} className="p-2 -mr-2 rounded-full hover:bg-surface-container-low active:scale-95 transition-all text-on-surface">
                  <Search size={24} />
                </button>
              </div>
            </div>
          </header>
        )}
        
        {/* Desktop Header for non-root pages */}
        {showHeader && !isRoot && (
          <header className="hidden md:flex sticky top-0 z-40 bg-background/80 backdrop-blur-md">
            <div className="w-full flex items-center px-8 py-5">
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-4 rounded-full hover:bg-surface-container-low active:scale-95 transition-all text-on-surface">
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl font-bold text-on-surface tracking-tight">
                Back
              </h1>
            </div>
          </header>
        )}

        <main className="flex-1 w-full max-w-5xl mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      {showBottomNav && (
        <motion.nav 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] z-50 bg-surface-container-lowest shadow-ambient rounded-full pb-safe-offset"
        >
          <div className="flex justify-around items-center px-1 py-1 overflow-x-auto gap-1 no-scrollbar relative">
            <NavItem icon={<FileText size={22} />} label="Home" isActive={currentPath === '/'} onClick={() => navigate('/')} />
            <NavItem icon={<Users size={22} />} label="Invoices" isActive={currentPath === '/debts'} onClick={() => navigate('/debts')} />
            <NavItem icon={<Users2 size={22} />} label="Clients" isActive={currentPath === '/clients'} onClick={() => navigate('/clients')} />
            <NavItem icon={<Package size={22} />} label="Catalog" isActive={currentPath === '/catalog'} onClick={() => navigate('/catalog')} />
            <NavItem icon={<BarChart3 size={22} />} label="Analytics" isActive={currentPath === '/analytics'} onClick={() => navigate('/analytics')} />
            
            <div className="relative">
              <NavItem icon={<Settings size={22} />} label="Settings" isActive={currentPath === '/settings'} onClick={() => navigate('/settings')} showGuide={needsSettingsSetup} />
              <AnimatePresence>
                {needsSettingsSetup && !dismissedSettingsTooltip && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute bottom-full right-0 mb-4 bg-primary text-on-primary text-xs font-bold px-4 py-3 rounded-2xl shadow-ambient w-48 z-50"
                  >
                    <div className="absolute right-6 bottom-[-6px] w-3 h-3 bg-primary rotate-45" />
                    <p>Start here! Set up your business details.</p>
                    <button onClick={dismissSettings} className="absolute top-1 right-1 p-1 opacity-70 hover:opacity-100">
                      <X size={12} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.nav>
      )}

      {/* Mobile FAB */}
      {showBottomNav && (
        <div className="md:hidden fixed bottom-32 right-6 z-50">
          <AnimatePresence>
            {needsFirstInvoice && !dismissedInvoiceTooltip && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-full right-0 mb-4 bg-primary text-on-primary text-xs font-bold px-4 py-3 rounded-2xl shadow-ambient w-48"
              >
                <div className="absolute right-4 bottom-[-6px] w-3 h-3 bg-primary rotate-45" />
                <p>You're all set! Create your first invoice here.</p>
                <button onClick={dismissInvoice} className="absolute top-1 right-1 p-1 opacity-70 hover:opacity-100">
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button 
            onClick={() => navigate('/create')}
            animate={needsFirstInvoice ? { scale: [1, 1.1, 1], boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 20px rgba(var(--color-primary), 0.6)", "0px 0px 0px rgba(0,0,0,0)"] } : {}}
            transition={needsFirstInvoice ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
            className="w-14 h-14 bg-gradient-to-br from-primary to-primary-heavy text-on-primary rounded-full shadow-ambient flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            {needsFirstInvoice && (
              <motion.span 
                className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-background"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <Plus size={28} />
          </motion.button>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick, isDesktop = false, showGuide = false }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, isDesktop?: boolean, showGuide?: boolean }) => {
  if (isDesktop) {
    return (
      <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-3xl transition-all active:scale-95 relative ${
          isActive ? 'text-secondary bg-gradient-to-r from-secondary-container to-secondary-container-heavy font-bold shadow-inner' : 'text-on-surface-variant hover:bg-surface-container-low font-medium'
        }`}
      >
        {showGuide && (
          <motion.span 
            className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-error rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        {React.cloneElement(icon as React.ReactElement, { 
          strokeWidth: isActive ? 2.5 : 2,
          className: isActive ? 'text-secondary' : 'text-on-surface-variant'
        })}
        <span className="text-sm tracking-wide">
          {label}
        </span>
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center px-5 py-2.5 rounded-full transition-all active:scale-95 relative ${
        isActive ? 'text-secondary bg-gradient-to-b from-secondary-container to-secondary-container-heavy shadow-inner' : 'text-on-surface-variant hover:bg-surface-container-low'
      }`}
    >
      {showGuide && (
        <motion.span 
          className="absolute top-1 right-3 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-container-lowest"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {React.cloneElement(icon as React.ReactElement, { 
        strokeWidth: isActive ? 2.5 : 2,
        className: isActive ? 'text-secondary' : 'text-on-surface-variant'
      })}
      <span className={`text-[10px] font-bold mt-1 tracking-wide ${isActive ? 'text-secondary' : 'text-on-surface-variant'}`}>
        {label}
      </span>
    </button>
  );
};
