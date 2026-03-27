import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

export const WelcomeScreen = ({ onComplete }: { onComplete: () => void, key?: string }) => {
  useEffect(() => {
    // Auto-dismiss the welcome screen after 2 seconds for a fast, effortless experience
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        <div className="mb-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-[1.5rem]">
          <Logo size={80} variant="icon" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-on-surface mb-2">
          Welcome back.
        </h1>
        <p className="text-on-surface-variant text-base font-medium">
          Ready to get paid.
        </p>
      </motion.div>
    </motion.div>
  );
};
