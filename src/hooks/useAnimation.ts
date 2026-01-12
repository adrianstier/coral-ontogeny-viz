/**
 * Hook for managing year animation
 */

import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export function useAnimation() {
  const { filters, ui, setCurrentYear, updateUI } = useStore();
  const { currentYear } = filters;
  const { playAnimation, animationSpeed } = ui;

  useEffect(() => {
    if (!playAnimation) return;

    const interval = setInterval(() => {
      useStore.setState((state) => {
        const nextYear = state.filters.currentYear + 1;

        // Stop at end or loop
        if (nextYear > 2023) {
          return {
            filters: { ...state.filters, currentYear: 2013 },
          };
        }

        return {
          filters: { ...state.filters, currentYear: nextYear },
        };
      });
    }, 1000 / useStore.getState().ui.animationSpeed);

    return () => clearInterval(interval);
  }, []);

  return null;
}
