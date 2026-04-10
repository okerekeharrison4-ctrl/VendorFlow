import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { generateId } from '../utils/helpers';
import { SwipeableItem } from '../components/SwipeableItem';
import { useGestureGuide } from '../hooks/useGestureGuide';
import { MockNativeAd } from '../components/MockNativeAd';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariant = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export const ClientsScreen = () => {
  const { clients, addClient, updateClient, deleteClient } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const showGuide = useGestureGuide('clients_swipe');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: ''
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      updateClient({ ...formData, id: editingId });
    } else {
      addClient({ ...formData, id: generateId() });
    }

    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', address: '', taxId: '' });
  };

  const handleEdit = (client: any) => {
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      taxId: client.taxId || ''
    });
    setEditingId(client.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClient(id);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 md:px-12 pt-4 md:pt-8 pb-40 md:pb-12"
    >
      <section className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Clients</h2>
          <p className="text-on-surface-variant text-sm font-medium">Manage your customer database.</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ name: '', email: '', phone: '', address: '', taxId: '' });
          }}
          className="w-12 h-12 bg-gradient-to-br from-primary to-primary-heavy text-on-primary rounded-full flex items-center justify-center shadow-ambient active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </section>

      {isAdding ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-surface-container-lowest to-surface-container-low rounded-3xl p-6 shadow-ambient mb-8 border border-surface-variant/50"
        >
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Client' : 'New Client'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Name *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-3xl px-5 py-4 text-on-surface font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                placeholder="Client Name"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-3xl px-5 py-4 text-on-surface font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                placeholder="client@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Phone</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-3xl px-5 py-4 text-on-surface font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Address</label>
              <textarea 
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-3xl px-5 py-4 text-on-surface font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none h-24"
                placeholder="Client Address"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Tax ID (Optional)</label>
              <input 
                type="text" 
                value={formData.taxId}
                onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-3xl px-5 py-4 text-on-surface font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. TIN, VAT No."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-4 text-on-surface-variant font-bold text-sm bg-surface-container-low hover:bg-surface-container-low/80 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 text-on-primary font-bold text-sm bg-gradient-to-r from-primary to-primary-heavy hover:opacity-90 rounded-full transition-opacity shadow-ambient"
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-full pl-12 pr-5 py-4 text-on-surface font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-ambient"
            />
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filteredClients.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant">
                <p>No clients found.</p>
              </div>
            ) : (
              <>
                {filteredClients.map((client, index) => (
                  <React.Fragment key={client.id || index}>
                    <motion.div variants={itemVariant}>
                      <SwipeableItem
                        onSwipeLeft={() => handleDelete(client.id)}
                        onSwipeRight={() => handleEdit(client)}
                        rightContent={<><Trash2 size={20} /> Delete</>}
                        leftContent={<><Edit2 size={20} /> Edit</>}
                        rightBgColor="bg-error"
                        leftBgColor="bg-primary"
                        showGuide={index === 0 && showGuide}
                      >
                        <div className="p-5 bg-surface-container-lowest border border-transparent hover:border-surface-variant/50 transition-colors rounded-3xl">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-on-surface">{client.name}</h3>
                          </div>
                          
                          <div className="space-y-1">
                            {client.email && (
                              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                                <Mail size={14} />
                                <span>{client.email}</span>
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                                <Phone size={14} />
                                <span className="font-mono">{client.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </SwipeableItem>
                    </motion.div>
                    {index === 1 && (
                      <motion.div variants={itemVariant}>
                        <MockNativeAd />
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
                {filteredClients.length < 2 && (
                  <motion.div variants={itemVariant}>
                    <MockNativeAd />
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};
