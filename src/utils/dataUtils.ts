/**
 * Utility functions for data processing and calculations
 */

import type { Coral } from '../types/coral';

/**
 * Compute the available year range from coral observations
 */
export function getYearRange(corals: Coral[]): [number, number] {
  if (corals.length === 0) {
    return [2013, 2024]; // Fallback default
  }

  let minYear = Infinity;
  let maxYear = -Infinity;

  corals.forEach((coral) => {
    coral.observations.forEach((obs) => {
      if (obs.year < minYear) minYear = obs.year;
      if (obs.year > maxYear) maxYear = obs.year;
    });
  });

  return minYear === Infinity ? [2013, 2024] : [minYear, maxYear];
}

/**
 * Generate array of years from min to max
 */
export function getYearArray(minYear: number, maxYear: number): number[] {
  const length = maxYear - minYear + 1;
  return Array.from({ length }, (_, i) => minYear + i);
}

/**
 * Get all unique years from coral observations
 */
export function getAvailableYears(corals: Coral[]): number[] {
  const yearSet = new Set<number>();

  corals.forEach((coral) => {
    coral.observations.forEach((obs) => {
      yearSet.add(obs.year);
    });
  });

  return Array.from(yearSet).sort((a, b) => a - b);
}
