import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/StoreContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Share2, Plus, Minus, Users2, Package, BarChart3 } from 'lucide-react';

const slides = [
    {
    id: 'welcome',
    headline: 'Get paid. Stay organized.',
    subtext: 'Simple invoices for your daily sales.',
    visual: (
      <motion.div 
        initial={{ rotate: -5 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[240px] bg-gradient-to-br from-surface-lowest to-surface-low rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-outline-variant/10 flex flex-col items-center text-center"
      >
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Amount owed to you</span>
        <h3 className="text-4xl font-black text-on-surface tracking-tighter mb-4">₦14,500</h3>
        <div className="w-full h-px bg-outline-variant/20 mb-4"></div>
        <div className="w-full space-y-2">
          <div className="h-8 bg-primary/10 rounded-full w-full"></div>
          <div className="h-8 bg-primary/5 rounded-full w-full"></div>
        </div>
      </motion.div>
    )
  },
  {
    id: 'invoices',
    headline: 'Create & Share Invoices',
    subtext: 'Generate invoices and share via WhatsApp instantly.',
    visual: (
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[240px] bg-gradient-to-br from-surface-lowest to-surface-low rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-outline-variant/10"
      >
        <div className="h-6 w-24 bg-outline-variant/20 rounded-full mb-6"></div>
        <div className="space-y-3">
          <div className="h-10 bg-surface-lowest border border-outline-variant/20 rounded-full w-full flex items-center px-4">
            <span className="text-xs text-on-surface-variant font-bold">Item name...</span>
          </div>
          <div className="w-full h-12 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20">
            <Share2 size={16} strokeWidth={2.5} />
            <span className="text-sm font-bold tracking-wide">Share on WhatsApp</span>
          </div>
        </div>
      </motion.div>
    )
  },
  {
    id: 'clients',
    headline: 'Manage Your Clients',
    subtext: 'Keep track of all your customers in one place.',
    visual: (
      <motion.div 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[240px] bg-gradient-to-br from-surface-lowest to-surface-low rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-outline-variant/10 flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-secondary-container to-secondary/20 text-secondary rounded-full flex items-center justify-center mb-4">
          <Users2 size={32} />
        </div>
        <h3 className="text-xl font-black text-on-surface tracking-tighter mb-1">Customer Database</h3>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Organized & Accessible</p>
      </motion.div>
    )
  },
  {
    id: 'catalog',
    headline: 'Build Your Catalog',
    subtext: 'Manage your products and services with ease.',
    visual: (
      <motion.div 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[240px] bg-gradient-to-br from-surface-lowest to-surface-low rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-outline-variant/10 flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-primary-container to-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
          <Package size={32} />
        </div>
        <h3 className="text-xl font-black text-on-surface tracking-tighter mb-1">Products & Services</h3>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Ready for Invoicing</p>
      </motion.div>
    )
  },
  {
    id: 'analytics',
    headline: 'Track Your Performance',
    subtext: 'Get insights into your sales and revenue.',
    visual: (
      <motion.div 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[240px] bg-gradient-to-br from-surface-lowest to-surface-low rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-outline-variant/10 flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-surface-low to-outline-variant/20 text-on-surface rounded-full flex items-center justify-center mb-4">
          <BarChart3 size={32} />
        </div>
        <h3 className="text-xl font-black text-on-surface tracking-tighter mb-1">Sales Analytics</h3>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Grow your business</p>
      </motion.div>
    )
  }
];

export const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { completeOnboarding } = useStore();
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const finishOnboarding = () => {
    completeOnboarding();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-surface-lowest to-surface-low z-50 flex flex-col">
      <div className="flex justify-end p-6">
        <button 
          onClick={finishOnboarding}
          className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm flex flex-col items-center text-center"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x;
              if (swipe < -50) {
                handleNext();
              } else if (swipe > 50) {
                handlePrev();
              }
            }}
          >
            <div className="h-64 w-full flex items-center justify-center mb-12">
              {slides[currentIndex].visual}
            </div>
            
            <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-3">
              {slides[currentIndex].headline}
            </h2>
            <p className="text-base font-medium text-on-surface-variant">
              {slides[currentIndex].subtext}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 pb-safe flex flex-col items-center gap-8">
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-outline-variant/30'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full max-w-sm py-4 bg-primary text-on-primary rounded-full font-bold text-lg tracking-wide shadow-lg shadow-primary/20 active:scale-[0.98] transition-all hover:bg-primary/90"
        >
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
};
