import { CommandPalette } from './components/CommandPalette';
import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store/StoreContext';
import { Layout } from './components/Layout';
import { HomeScreen } from './screens/HomeScreen';
import { CreateInvoiceScreen } from './screens/CreateInvoiceScreen';
import { PreviewScreen } from './screens/PreviewScreen';
import { DebtListScreen } from './screens/DebtListScreen';
import { ReceiptScreen } from './screens/ReceiptScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LandingScreen } from './screens/LandingScreen';
import { ClientsScreen } from './screens/ClientsScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAdSystem } from './hooks/useAdSystem';
import { TimedInterstitialAd } from './components/TimedInterstitialAd';
import { SubscriptionModal } from './components/SubscriptionModal';

const AppContent = () => {
  const { hasCompletedOnboarding, isLoading, theme, isPaletteOpen, togglePalette, isPremium } = useStore();
  const { checkAndShowInterstitial } = useAdSystem();
  
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePalette]);
  
  useEffect(() => {
    console.log('App theme in AppContent:', theme);
  }, [theme]);
  const location = useLocation();
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const hasCheckedAd = React.useRef(false);

  const locationRef = React.useRef(location.pathname);
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  // Listen for custom event to open subscription modal
  useEffect(() => {
    const handleOpenSubscription = () => setShowSubscriptionModal(true);
    window.addEventListener('open_subscription_modal', handleOpenSubscription);
    return () => window.removeEventListener('open_subscription_modal', handleOpenSubscription);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (hasCompletedOnboarding) {
      const lastOpened = localStorage.getItem('vendorflow_last_opened');
      const hasSeenSubscription = localStorage.getItem('vendorflow_has_seen_subscription');
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;
      
      if (!lastOpened || now - parseInt(lastOpened) > ONE_HOUR) {
        setShowWelcome(true);
      } else {
        localStorage.setItem('vendorflow_last_opened', now.toString());
      }

      // Show subscription modal on first login if not premium
      if (!hasSeenSubscription && !isPremium && !showWelcome) {
        setTimeout(() => {
          setShowSubscriptionModal(true);
          localStorage.setItem('vendorflow_has_seen_subscription', 'true');
        }, 2000);
      }

      const tryShowInterstitial = () => {
        const currentPath = locationRef.current;
        const isSafeScreen = currentPath === '/' || currentPath === '/debts' || currentPath === '/settings' || currentPath === '/clients' || currentPath === '/catalog' || currentPath === '/analytics';
        
        if (isSafeScreen && checkAndShowInterstitial() && !showSubscriptionModal) {
          setShowInterstitial(true);
        }
      };

      // Check for interstitial ad after a short delay to allow app to load
      if (!hasCheckedAd.current) {
        hasCheckedAd.current = true;
        setTimeout(tryShowInterstitial, 1500);
      }

      const handleForeground = () => {
        setTimeout(tryShowInterstitial, 1500);
      };

      window.addEventListener('vendorflow_foreground', handleForeground);
      return () => {
        window.removeEventListener('vendorflow_foreground', handleForeground);
      };
    }
  }, [isLoading, hasCompletedOnboarding, checkAndShowInterstitial, isPremium, showWelcome, showSubscriptionModal]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-7xl min-h-screen bg-background flex items-center justify-center text-on-surface">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="font-bold tracking-wide">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-7xl min-h-screen bg-background relative overflow-hidden">
          {showLanding ? (
            <LandingScreen onStart={() => setShowLanding(false)} />
          ) : (
            <OnboardingScreen />
          )}
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-7xl min-h-screen bg-background relative overflow-hidden">
          <AnimatePresence mode="wait">
            <WelcomeScreen 
              key="welcome" 
              onComplete={() => {
                localStorage.setItem('vendorflow_last_opened', Date.now().toString());
                setShowWelcome(false);
              }} 
            />
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${theme === 'dark' ? 'dark' : ''}`}>
      <CommandPalette isOpen={isPaletteOpen} onClose={togglePalette} />
      <div className="w-full max-w-7xl mx-auto min-h-screen bg-background text-on-surface relative overflow-hidden">
        <Layout>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Routes location={location}>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/create" element={<CreateInvoiceScreen />} />
                <Route path="/preview/:id" element={<PreviewScreen />} />
                <Route path="/debts" element={<DebtListScreen />} />
                <Route path="/receipt/:id" element={<ReceiptScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
                <Route path="/clients" element={<ClientsScreen />} />
                <Route path="/catalog" element={<CatalogScreen />} />
                <Route path="/analytics" element={<AnalyticsScreen />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Layout>

        {showInterstitial && (
          <TimedInterstitialAd 
            type="interstitial" 
            onClose={() => setShowInterstitial(false)} 
            onComplete={() => {}} 
          />
        )}

        <SubscriptionModal 
          isOpen={showSubscriptionModal} 
          onClose={() => setShowSubscriptionModal(false)} 
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </StoreProvider>
  );
}
