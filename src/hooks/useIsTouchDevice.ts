import { useEffect, useState } from 'react';

/**
 * Hook to detect if the device has touch capability
 * Uses (pointer: coarse) media query for accurate detection
 * Works for phones, tablets, and touch laptops
 */
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia('(pointer: coarse)');
    const onChange = () => {
      setIsTouchDevice(mql.matches);
    };

    // Modern browsers support addEventListener on MediaQueryList
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
    } else {
      // Fallback for older browsers
      mql.addListener(onChange);
    }

    // Set initial value
    setIsTouchDevice(mql.matches);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange);
      } else {
        mql.removeListener(onChange);
      }
    };
  }, []);

  return isTouchDevice;
}
