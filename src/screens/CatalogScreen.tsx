import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { formatCurrency, generateId } from '../utils/helpers';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariant = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export const CatalogScreen = () => {
  const { catalog, addCatalogItem, updateCatalogItem, deleteCatalogItem, currency } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0
  });

  const filteredItems = catalog.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price < 0) return;

    if (editingId) {
      updateCatalogItem({ ...formData, id: editingId });
    } else {
      addCatalogItem({ ...formData, id: generateId() });
    }

    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', description: '', price: 0 });
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteCatalogItem(id);
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
          <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Catalog</h2>
          <p className="text-on-surface-variant text-sm font-medium">Manage your products and services.</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ name: '', description: '', price: 0 });
          }}
          className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-ambient active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </section>

      {isAdding ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient mb-8"
        >
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Item' : 'New Item'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Item Name *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-3xl px-5 py-4 text-on-surface font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                placeholder="Product or Service Name"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Price *</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">{currency.symbol}</span>
                <input 
                  type="number" 
                  value={formData.price || ''}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-3xl pl-12 pr-5 py-4 text-on-surface font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-3xl px-5 py-4 text-on-surface font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none h-24"
                placeholder="Optional description"
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
                className="flex-1 py-4 text-on-primary font-bold text-sm bg-primary hover:bg-primary/90 rounded-full transition-colors"
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
              placeholder="Search catalog..."
              className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-full pl-12 pr-5 py-4 text-on-surface font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-ambient"
            />
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filteredItems.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant">
                <p>No items found in catalog.</p>
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <motion.div 
                  key={item.id || index} 
                  variants={itemVariant}
                  className="bg-surface-container-lowest p-5 rounded-3xl shadow-ambient flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface">{item.name}</h3>
                      <p className="text-sm font-mono font-bold text-on-surface-variant truncate max-w-[150px]" title={formatCurrency(item.price, currency.symbol)}>{formatCurrency(item.price, currency.symbol)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="p-4 text-on-surface-variant hover:text-primary transition-colors">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-4 text-on-surface-variant hover:text-error transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};
