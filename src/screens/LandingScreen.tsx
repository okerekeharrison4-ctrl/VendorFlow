import React from 'react';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

interface LandingScreenProps {
  onStart: () => void;
}

export const LandingScreen = ({ onStart }: LandingScreenProps) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-surface-lowest to-surface-low z-[60] flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <div className="mb-12 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[2rem]">
          <Logo size={120} variant="icon" />
        </div>
        
        <h1 className="text-5xl font-black tracking-tighter text-on-surface mb-4 leading-[0.9]">
          VendorFlow
        </h1>
        
        <p className="text-xl font-bold text-on-surface-variant mb-12">
          Your #1 pocket office for vendors
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-5 bg-primary text-on-primary rounded-full font-bold text-xl tracking-wide shadow-xl shadow-primary/25 transition-all hover:bg-primary/90"
        >
          Get Started
        </motion.button>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-12 text-on-surface-variant/40 font-bold text-xs uppercase tracking-[0.2em]"
      >
        Professional • Fast • Reliable
      </motion.div>
    </div>
  );
};
