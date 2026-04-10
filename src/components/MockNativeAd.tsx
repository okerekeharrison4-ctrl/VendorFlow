import React from 'react';
import { ExternalLink } from 'lucide-react';

export const MockNativeAd = () => {
  return (
    <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-ambient border border-primary/10 flex flex-col relative overflow-hidden group cursor-pointer">
      <div className="absolute top-3 right-3 bg-surface-container-low text-on-surface-variant text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
        Ad
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <ExternalLink size={20} />
        </div>
        <div>
          <h3 className="font-bold text-on-surface line-clamp-1">Grow Your Business</h3>
          <p className="text-sm font-bold text-on-surface-variant truncate max-w-[150px]">
            Google Ads
          </p>
        </div>
      </div>
      <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 flex-1">
        Get a $500 credit for Google Ads when you spend your first $500. Reach more customers today.
      </p>
      <div className="w-full py-3 bg-primary/10 text-primary rounded-full font-bold text-sm text-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
        Learn More
      </div>
    </div>
  );
};
