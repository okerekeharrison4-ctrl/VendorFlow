import React, { useEffect } from 'react';
import { useStore } from '../store/StoreContext';

interface AdSenseAdProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layoutKey?: string;
  className?: string;
  showWrapper?: boolean;
}

export const AdSenseAd: React.FC<AdSenseAdProps> = ({ slot, format = 'auto', layoutKey, className = '', showWrapper = true }) => {
  const isLoaded = React.useRef(false);
  const { isPremium } = useStore();

  useEffect(() => {
    if (!isLoaded.current && !isPremium) {
      try {
        isLoaded.current = true;
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e: any) {
        if (!e.message?.includes('already have ads')) {
          console.error('AdSense error:', e);
        }
      }
    }
  }, [isPremium]);

  if (isPremium) {
    return null;
  }

  const adContent = (
    <ins className="adsbygoogle"
         style={{ display: 'block' }}
         data-ad-client="ca-pub-4083665956931552"
         data-ad-slot={slot}
         data-ad-format={format}
         {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
         data-full-width-responsive="true"></ins>
  );

  if (!showWrapper) {
    return <div className={className}>{adContent}</div>;
  }

  return (
    <div className={`bg-surface-container-lowest rounded-3xl p-5 shadow-ambient border border-primary/10 flex flex-col relative overflow-hidden ${className}`}>
      <div className="absolute top-3 right-3 bg-surface-container-low text-on-surface-variant text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
        Ad
      </div>
      {adContent}
    </div>
  );
};
