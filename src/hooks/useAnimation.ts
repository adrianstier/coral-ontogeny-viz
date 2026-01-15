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

    // Calculate timing to make full cycle take 10 seconds
    // Total years to traverse (e.g., 2013-2024 = 12 steps)
    const totalYears = maxYear - minYear + 1;
    const targetDuration = 10000; // 10 seconds in milliseconds
    const baseInterval = targetDuration / totalYears; // ~833ms per year for 12 years

    // Apply user's speed multiplier
    const interval = setInterval(() => {
      const nextYear = useStore.getState().filters.currentYear + 1;

      // Loop back to beginning when reaching the end
      if (nextYear > maxYear) {
        setCurrentYear(minYear);
      } else {
        setCurrentYear(nextYear);
      }
    }, baseInterval / animationSpeed);

    return () => clearInterval(interval);
  }, [playAnimation, animationSpeed, minYear, maxYear, setCurrentYear]);

  return null;
}
