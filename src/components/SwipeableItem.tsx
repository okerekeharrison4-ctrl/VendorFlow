import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'motion/react';

interface SwipeableItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void; // Triggered when swiping left (reveals right side)
  onSwipeRight?: () => void; // Triggered when swiping right (reveals left side)
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  leftBgColor?: string;
  rightBgColor?: string;
  showGuide?: boolean; // If true, plays a peek animation
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftContent,
  rightContent,
  leftBgColor = 'bg-primary',
  rightBgColor = 'bg-error',
  showGuide = false,
}) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Threshold to trigger action
  const THRESHOLD = 80;

  useEffect(() => {
    let isMounted = true;
    if (showGuide) {
      // Play a peek animation after a short delay
      const playPeek = async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (!isMounted) return;
        
        try {
          if (onSwipeLeft && rightContent) {
            // Peek left (swipe left)
            await controls.start({ x: -50, transition: { duration: 0.3, ease: 'easeOut' } });
            if (!isMounted) return;
            await controls.start({ x: 0, transition: { duration: 0.4, ease: 'easeIn', delay: 0.1 } });
          } else if (onSwipeRight && leftContent) {
            // Peek right
            await controls.start({ x: 50, transition: { duration: 0.3, ease: 'easeOut' } });
            if (!isMounted) return;
            await controls.start({ x: 0, transition: { duration: 0.4, ease: 'easeIn', delay: 0.1 } });
          }
        } catch (error) {
          // Ignore animation errors if unmounted
        }
      };
      playPeek();
    }
    return () => {
      isMounted = false;
    };
  }, [showGuide, controls, onSwipeLeft, onSwipeRight, rightContent, leftContent]);

  const handleDragEnd = async (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (onSwipeLeft && rightContent && (offset < -THRESHOLD || (offset < 0 && velocity < -500))) {
      await controls.start({ x: -window.innerWidth, transition: { duration: 0.2 } });
      onSwipeLeft();
      controls.set({ x: 0 });
    } else if (onSwipeRight && leftContent && (offset > THRESHOLD || (offset > 0 && velocity > 500))) {
      await controls.start({ x: window.innerWidth, transition: { duration: 0.2 } });
      onSwipeRight();
      controls.set({ x: 0 });
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const leftOpacity = useTransform(x, [0, THRESHOLD], [0, 1]);
  const rightOpacity = useTransform(x, [0, -THRESHOLD], [0, 1]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl mb-3" ref={containerRef}>
      {/* Background Actions */}
      <div className="absolute inset-0 flex justify-between items-center z-0 rounded-3xl overflow-hidden">
        {/* Left Action (Revealed when swiping right) */}
        <div className={`absolute inset-y-0 left-0 w-1/2 flex items-center pl-6 ${leftBgColor}`}>
          <motion.div style={{ opacity: leftOpacity }} className="text-white font-bold flex items-center gap-2">
            {leftContent}
          </motion.div>
        </div>
        
        {/* Right Action (Revealed when swiping left) */}
        <div className={`absolute inset-y-0 right-0 w-1/2 flex items-center justify-end pr-6 ${rightBgColor}`}>
          <motion.div style={{ opacity: rightOpacity }} className="text-white font-bold flex items-center gap-2">
            {rightContent}
          </motion.div>
        </div>
      </div>

      {/* Foreground Draggable Item */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, touchAction: 'pan-y' }}
        className="relative z-10 w-full bg-surface-container-lowest shadow-ambient rounded-3xl"
      >
        {children}
      </motion.div>
    </div>
  );
};
