import { useState, useEffect, useCallback } from 'react';

interface AdState {
  lastOpenTime: number;
  interstitialCount: number;
  interstitialDate: string;
  rewardedInvoices: string[];
  rewardedReceipts: string[];
}

const getInitialAdState = (): AdState => {
  const stored = localStorage.getItem('vendorflow_ads');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return {
    lastOpenTime: 0,
    interstitialCount: 0,
    interstitialDate: new Date().toDateString(),
    rewardedInvoices: [],
    rewardedReceipts: [],
  };
};

export const useAdSystem = () => {
  const [adState, setAdState] = useState<AdState>(getInitialAdState);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('vendorflow_ads', JSON.stringify(adState));
  }, [adState]);

  const checkAndShowInterstitial = useCallback((): boolean => {
    if (!isOnline) return false;
    
    const now = Date.now();
    const today = new Date().toDateString();
    
    let currentCount = adState.interstitialCount;
    if (adState.interstitialDate !== today) {
      currentCount = 0;
    }
    
    const timeSinceLastOpen = now - adState.lastOpenTime;
    const fourHours = 4 * 60 * 60 * 1000;
    
    const isFirstOpenToday = adState.interstitialDate !== today || adState.lastOpenTime === 0;
    const isReturnAfter4Hours = timeSinceLastOpen > fourHours;

    if ((isFirstOpenToday || isReturnAfter4Hours) && currentCount < 2) {
      setAdState(prev => ({
        ...prev,
        lastOpenTime: now,
        interstitialCount: currentCount + 1,
        interstitialDate: today
      }));
      return true;
    }
    
    // Just update last open time if we don't show ad
    setAdState(prev => ({
      ...prev,
      lastOpenTime: now,
      interstitialCount: currentCount,
      interstitialDate: today
    }));
    return false;
  }, [adState, isOnline]);

  // Update last open time when app goes to background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setAdState(prev => ({
          ...prev,
          lastOpenTime: Date.now()
        }));
      } else if (document.visibilityState === 'visible') {
        // We don't call checkAndShowInterstitial directly here because we don't have access to setShowInterstitial from App.tsx.
        // Instead, we can dispatch a custom event that App.tsx listens to.
        window.dispatchEvent(new Event('vendorflow_foreground'));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const markRewarded = useCallback((type: 'invoice' | 'receipt', id: string) => {
    setAdState(prev => ({
      ...prev,
      ...(type === 'invoice' 
        ? { rewardedInvoices: [...prev.rewardedInvoices, id] }
        : { rewardedReceipts: [...prev.rewardedReceipts, id] }
      )
    }));
  }, []);

  const hasRewarded = useCallback((type: 'invoice' | 'receipt', id: string) => {
    return type === 'invoice' 
      ? adState.rewardedInvoices.includes(id)
      : adState.rewardedReceipts.includes(id);
  }, [adState]);

  return {
    isOnline,
    checkAndShowInterstitial,
    markRewarded,
    hasRewarded
  };
};
