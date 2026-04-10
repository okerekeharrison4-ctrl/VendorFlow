import { useState, useEffect } from 'react';

export const useGestureGuide = (featureKey: string) => {
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem(`has_seen_guide_${featureKey}`);
    if (!hasSeenGuide) {
      setShowGuide(true);
      localStorage.setItem(`has_seen_guide_${featureKey}`, 'true');
    }
  }, [featureKey]);

  return showGuide;
};
