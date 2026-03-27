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
import { ClientsScreen } from './screens/ClientsScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAdSystem } from './hooks/useAdSystem';
import { MockAdVideo } from './components/MockAdVideo';

const AppContent = () => {
  const { hasCompletedOnboarding, isLoading, theme } = useStore();
  const { checkAndShowInterstitial } = useAdSystem();
  
  useEffect(() => {
    console.log('App theme in AppContent:', theme);
  }, [theme]);
  const location = useLocation();
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const hasCheckedAd = React.useRef(false);

  const locationRef = React.useRef(location.pathname);
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (isLoading) return;

    if (hasCompletedOnboarding) {
      const lastOpened = localStorage.getItem('vendorflow_last_opened');
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;
      
      if (!lastOpened || now - parseInt(lastOpened) > ONE_HOUR) {
        setShowWelcome(true);
      } else {
        localStorage.setItem('vendorflow_last_opened', now.toString());
      }

      const tryShowInterstitial = () => {
        const currentPath = locationRef.current;
        const isSafeScreen = currentPath === '/' || currentPath === '/debts' || currentPath === '/settings' || currentPath === '/clients' || currentPath === '/catalog' || currentPath === '/analytics';
        
        if (isSafeScreen && checkAndShowInterstitial()) {
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
  }, [isLoading, hasCompletedOnboarding, checkAndShowInterstitial]);

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
    return <div className="fixed inset-0 flex items-center justify-center bg-background">Loading...</div>;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  if (showWelcome) {
    return (
      <AnimatePresence mode="wait">
        <WelcomeScreen 
          key="welcome" 
          onComplete={() => {
            localStorage.setItem('vendorflow_last_opened', Date.now().toString());
            setShowWelcome(false);
          }} 
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
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
        <MockAdVideo 
          type="interstitial" 
          onClose={() => setShowInterstitial(false)} 
          onComplete={() => {}} 
        />
      )}
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
