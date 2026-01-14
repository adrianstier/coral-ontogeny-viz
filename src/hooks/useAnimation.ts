/**
 * Hook for managing year animation
 */

import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useAnimation() {
  const { filters, ui, setCurrentYear } = useStore();
  const { yearRange } = filters;
  const { playAnimation, animationSpeed } = ui;

  const [minYear, maxYear] = yearRange;

  useEffect(() => {
    if (!playAnimation) return;

    const interval = setInterval(() => {
      const nextYear = useStore.getState().filters.currentYear + 1;

      // Loop back to beginning when reaching the end
      if (nextYear > maxYear) {
        setCurrentYear(minYear);
      } else {
        setCurrentYear(nextYear);
      }
    }, 1000 / animationSpeed);

    return () => clearInterval(interval);
  }, [playAnimation, animationSpeed, minYear, maxYear, setCurrentYear]);

  return null;
}
