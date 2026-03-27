import { useState, useEffect, useCallback } from 'react';
import { track } from '../utils/analytics';

interface AdState {
  lastOpenTime: number;
  interstitialCount: number;
  interstitialDate: string;
  rewardedInvoices: string[];
  rewardedReceipts: string[];
  sessionCount: number;
}

const getInitialAdState = (): AdState => {
  const stored = localStorage.getItem('vendorflow_ads');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        sessionCount: parsed.sessionCount || 1,
      };
    } catch (e) {}
  }
  return {
    lastOpenTime: 0,
    interstitialCount: 0,
    interstitialDate: new Date().toDateString(),
    rewardedInvoices: [],
    rewardedReceipts: [],
    sessionCount: 1,
  };
};

export const useAdSystem = () => {
  const [adState, setAdState] = useState<AdState>(getInitialAdState);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [rewardedAdsWatchedThisSession, setRewardedAdsWatchedThisSession] = useState(0);
  
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

  // Increment session count on mount if it's been a while
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastOpen = now - adState.lastOpenTime;
    const fourHours = 4 * 60 * 60 * 1000;
    if (timeSinceLastOpen > fourHours) {
      setAdState(prev => ({
        ...prev,
        sessionCount: prev.sessionCount + 1,
        lastOpenTime: now,
      }));
    }
  }, []);

  const checkAndShowInterstitial = useCallback((): boolean => {
    if (!isOnline) return false;
    
    // Interstitial Refinement: Protect first-time user experience
    const storedInvoices = localStorage.getItem('vendorflow_invoices');
    let invoiceCount = 0;
    if (storedInvoices) {
      try {
        invoiceCount = JSON.parse(storedInvoices).length;
      } catch (e) {}
    }

    if (invoiceCount < 1 && adState.sessionCount < 2) {
      return false; // Do NOT show interstitial
    }
    
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
      track('interstitial_shown');
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
    setRewardedAdsWatchedThisSession(prev => prev + 1);
    track('reward_completed', { type, id });
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
    hasRewarded,
    rewardedAdsWatchedThisSession
  };
};
