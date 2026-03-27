import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Users, Settings, Plus, ArrowLeft, BarChart3, Package, Users2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const showBottomNav = ['/', '/debts', '/settings', '/clients', '/catalog', '/analytics'].includes(currentPath);
  const showHeader = true;
  const isRoot = ['/', '/debts', '/settings', '/clients', '/catalog', '/analytics'].includes(currentPath);

  const getTitle = () => {
    return 'VendorFlow';
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col pb-32 relative">
      {showHeader && (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant/10">
          <div className="w-full flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-4">
              {!isRoot ? (
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-low active:scale-95 transition-all text-on-surface">
                  <ArrowLeft size={24} />
                </button>
              ) : (
                <Logo size={32} variant="icon" />
              )}
              <h1 className="text-xl font-bold text-on-surface tracking-tight">
                {getTitle()}
              </h1>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 w-full">
        {children}
      </main>

      {showBottomNav && (
        <motion.nav 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] z-50 bg-surface-lowest/80 backdrop-blur-2xl border border-outline-variant/20 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-full pb-safe-offset"
        >
          <div className="flex justify-around items-center px-1 py-1 overflow-x-auto gap-1 no-scrollbar">
            <NavItem 
              icon={<FileText size={22} />} 
              label="Home" 
              isActive={currentPath === '/'} 
              onClick={() => navigate('/')} 
            />
            <NavItem 
              icon={<Users size={22} />} 
              label="Invoices" 
              isActive={currentPath === '/debts'} 
              onClick={() => navigate('/debts')} 
            />
            <NavItem 
              icon={<Users2 size={22} />} 
              label="Clients" 
              isActive={currentPath === '/clients'} 
              onClick={() => navigate('/clients')} 
            />
            <NavItem 
              icon={<Package size={22} />} 
              label="Catalog" 
              isActive={currentPath === '/catalog'} 
              onClick={() => navigate('/catalog')} 
            />
            <NavItem 
              icon={<BarChart3 size={22} />} 
              label="Analytics" 
              isActive={currentPath === '/analytics'} 
              onClick={() => navigate('/analytics')} 
            />
            <NavItem 
              icon={<Settings size={22} />} 
              label="Settings" 
              isActive={currentPath === '/settings'} 
              onClick={() => navigate('/settings')} 
            />
          </div>
        </motion.nav>
      )}

      {showBottomNav && (
        <button 
          onClick={() => navigate('/create')}
          className="fixed bottom-32 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 border-4 border-background"
        >
          <Plus size={28} />
        </button>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center px-5 py-2.5 rounded-full transition-all active:scale-95 ${
        isActive ? 'text-secondary bg-secondary-container/50' : 'text-on-surface-variant hover:bg-surface-low/50'
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
