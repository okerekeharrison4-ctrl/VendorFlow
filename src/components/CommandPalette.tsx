import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Users, Users2, Package, BarChart3, Settings, Plus, X } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'home', label: 'Go to Home', icon: <FileText size={18} />, action: () => navigate('/') },
    { id: 'invoices', label: 'Go to Invoices', icon: <Users size={18} />, action: () => navigate('/debts') },
    { id: 'clients', label: 'Go to Clients', icon: <Users2 size={18} />, action: () => navigate('/clients') },
    { id: 'catalog', label: 'Go to Catalog', icon: <Package size={18} />, action: () => navigate('/catalog') },
    { id: 'analytics', label: 'Go to Analytics', icon: <BarChart3 size={18} />, action: () => navigate('/analytics') },
    { id: 'settings', label: 'Go to Settings', icon: <Settings size={18} />, action: () => navigate('/settings') },
    { id: 'create-invoice', label: 'Create New Invoice', icon: <Plus size={18} />, action: () => navigate('/create') },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-surface-container-low">
              <Search className="text-on-surface-variant mr-3" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search commands..."
                className="w-full bg-transparent border-none outline-none text-on-surface font-medium"
              />
              <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-low">
                <X size={18} className="text-on-surface-variant" />
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="p-4 text-center text-on-surface-variant text-sm">No commands found.</div>
              ) : (
                filteredCommands.map(cmd => (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); onClose(); }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-surface-container-low hover:to-surface-container-lowest transition-colors text-on-surface text-sm font-medium"
                  >
                    {cmd.icon}
                    {cmd.label}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
