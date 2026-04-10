import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';

interface MockAdVideoProps {
  onComplete: () => void;
  onClose: () => void;
  type: 'interstitial' | 'rewarded';
  successMessage?: string;
}

export const MockAdVideo: React.FC<MockAdVideoProps> = ({ onComplete, onClose, type, successMessage = 'Reward Granted!' }) => {
  const [timeLeft, setTimeLeft] = useState(type === 'rewarded' ? 5 : 3);
  const [canClose, setCanClose] = useState(false);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!hasCompleted) {
      setCanClose(true);
      setHasCompleted(true);
      if (type === 'rewarded') {
        setRewardGranted(true);
        onComplete();
      }
    }
  }, [timeLeft, type, onComplete, hasCompleted]);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[200] bg-surface-container-lowest flex flex-col items-center justify-center text-on-surface"
      >
        {canClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-surface-container-low rounded-full hover:bg-surface-high transition-colors"
          >
            <X size={24} />
          </button>
        )}
        
        <div className="text-center space-y-6">
          <p className="text-sm font-bold tracking-widest uppercase text-on-surface-variant">Advertisement</p>
          
          {rewardGranted ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black">{successMessage}</h2>
              <p className="text-on-surface-variant">You can now close this ad.</p>
              <button 
                onClick={onClose}
                className="mt-4 px-8 py-3 bg-gradient-to-r from-primary to-primary-heavy text-on-primary rounded-full font-bold text-sm active:scale-[0.98] transition-all hover:opacity-90 shadow-ambient"
              >
                Continue
              </button>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-black">
                {type === 'rewarded' ? 'Sponsor Message' : 'Discover More'}
              </h2>
              
              <div className="w-64 h-3 bg-surface-container-low rounded-full overflow-hidden mx-auto">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(( (type === 'rewarded' ? 5 : 3) - timeLeft) / (type === 'rewarded' ? 5 : 3)) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
              
              <p className="text-sm font-medium text-on-surface-variant">
                {timeLeft > 0 ? `Video ends in ${timeLeft}s` : 'You can close this ad now'}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
