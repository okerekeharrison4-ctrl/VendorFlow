import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Users, Settings, Plus, ArrowLeft, BarChart3, Package, Users2, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { useStore } from '../store/StoreContext';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { togglePalette } = useStore();
  const currentPath = location.pathname;

  const showBottomNav = ['/', '/debts', '/settings', '/clients', '/catalog', '/analytics'].includes(currentPath);
  const showHeader = true;
  const isRoot = ['/', '/debts', '/settings', '/clients', '/catalog', '/analytics'].includes(currentPath);

  const getTitle = () => {
    return 'VendorFlow';
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
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <NavItem icon={<FileText size={22} />} label="Home" isActive={currentPath === '/'} onClick={() => navigate('/')} isDesktop />
            <NavItem icon={<Users size={22} />} label="Invoices" isActive={currentPath === '/debts'} onClick={() => navigate('/debts')} isDesktop />
            <NavItem icon={<Users2 size={22} />} label="Clients" isActive={currentPath === '/clients'} onClick={() => navigate('/clients')} isDesktop />
            <NavItem icon={<Package size={22} />} label="Catalog" isActive={currentPath === '/catalog'} onClick={() => navigate('/catalog')} isDesktop />
            <NavItem icon={<BarChart3 size={22} />} label="Analytics" isActive={currentPath === '/analytics'} onClick={() => navigate('/analytics')} isDesktop />
            <NavItem icon={<Settings size={22} />} label="Settings" isActive={currentPath === '/settings'} onClick={() => navigate('/settings')} isDesktop />
          </nav>
          <div className="p-6">
            <button 
              onClick={() => navigate('/create')}
              className="w-full bg-primary text-on-primary py-3 rounded-3xl font-bold shadow-ambient flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus size={20} />
              New Invoice
            </button>
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
              <button onClick={togglePalette} className="p-2 -mr-2 rounded-full hover:bg-surface-container-low active:scale-95 transition-all text-on-surface">
                <Search size={24} />
              </button>
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
          <div className="flex justify-around items-center px-1 py-1 overflow-x-auto gap-1 no-scrollbar">
            <NavItem icon={<FileText size={22} />} label="Home" isActive={currentPath === '/'} onClick={() => navigate('/')} />
            <NavItem icon={<Users size={22} />} label="Invoices" isActive={currentPath === '/debts'} onClick={() => navigate('/debts')} />
            <NavItem icon={<Users2 size={22} />} label="Clients" isActive={currentPath === '/clients'} onClick={() => navigate('/clients')} />
            <NavItem icon={<Package size={22} />} label="Catalog" isActive={currentPath === '/catalog'} onClick={() => navigate('/catalog')} />
            <NavItem icon={<BarChart3 size={22} />} label="Analytics" isActive={currentPath === '/analytics'} onClick={() => navigate('/analytics')} />
            <NavItem icon={<Settings size={22} />} label="Settings" isActive={currentPath === '/settings'} onClick={() => navigate('/settings')} />
          </div>
        </motion.nav>
      )}

      {/* Mobile FAB */}
      {showBottomNav && (
        <button 
          onClick={() => navigate('/create')}
          className="md:hidden fixed bottom-32 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-ambient flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
        >
          <Plus size={28} />
        </button>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick, isDesktop = false }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, isDesktop?: boolean }) => {
  if (isDesktop) {
    return (
      <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-3xl transition-all active:scale-95 ${
          isActive ? 'text-secondary bg-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-low font-medium'
        }`}
      >
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
      className={`flex flex-col items-center justify-center px-5 py-2.5 rounded-full transition-all active:scale-95 ${
        isActive ? 'text-secondary bg-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-low'
      }`}
    >
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
