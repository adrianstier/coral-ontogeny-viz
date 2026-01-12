/**
 * Statistical utilities for coral demographic analysis
 */

import { Coral, Genus, SurvivalEvent, YearData } from '../types/coral';

const YEARS = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];

/**
 * Aggregate coral data by year and genus
 */
export function aggregateByYear(corals: Coral[], genera: Genus[]): YearData[] {
  return YEARS.map((year) => {
    const byGenus: any = { year };

    genera.forEach((g) => {
      const genusCorals = corals.filter((c) => c.genus === g);

      const alive = genusCorals.filter((c) =>
        c.observations.some((o) => o.year === year && o.is_alive)
      );

      const recruits = genusCorals.filter((c) =>
        c.observations.some((o) => o.year === year && o.is_recruit)
      );

      const deaths = genusCorals.filter((c) =>
        c.observations.some((o) => o.year === year && o.fate?.toLowerCase().includes('death'))
      );

      byGenus[g] = {
        count: alive.length,
        recruits: recruits.length,
        deaths: deaths.length,
      };
    });

    return byGenus;
  });
}

/**
 * Compute mean size for corals in a specific year
 */
export function computeMeanSize(corals: Coral[], year: number, metric: string = 'volume_proxy'): number {
  const sizes: number[] = [];

  corals.forEach((coral) => {
    const obs = coral.observations.find((o) => o.year === year && o.is_alive);
    if (obs) {
      const size = (obs as any)[metric];
      if (size !== null && size !== undefined) {
        sizes.push(size);
      }
    }
  });

  if (sizes.length === 0) return 0;
  return sizes.reduce((sum, s) => sum + s, 0) / sizes.length;
}

/**
 * Compute standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Compute Kaplan-Meier survival curve
 */
export function kaplanMeier(events: SurvivalEvent[]): Array<{ time: number; survival: number }> {
  // Sort events by duration
  const sorted = events.sort((a, b) => a.duration - b.duration);

  let atRisk = events.length;
  let survival = 1.0;
  const curve: Array<{ time: number; survival: number }> = [{ time: 0, survival: 1.0 }];

  let currentTime = 0;
  let deaths = 0;
  let censored = 0;

  for (let i = 0; i < sorted.length; i++) {
    const event = sorted[i];

    // When time changes, calculate survival
    if (event.duration !== currentTime && deaths > 0) {
      survival *= (atRisk - deaths) / atRisk;
      curve.push({ time: currentTime, survival });
      atRisk -= deaths + censored;
      deaths = 0;
      censored = 0;
    }

    currentTime = event.duration;

    if (event.event === 1) {
      deaths++;
    } else {
      censored++;
    }
  }

  // Handle final time point
  if (deaths > 0) {
    survival *= (atRisk - deaths) / atRisk;
    curve.push({ time: currentTime, survival });
  }

  return curve;
}

/**
 * Prepare survival events from coral data
 */
export function prepareSurvivalEvents(corals: Coral[]): SurvivalEvent[] {
  const events: SurvivalEvent[] = [];

  corals.forEach((c) => {
    if (c.recruitment_year) {
      const duration = c.death_year
        ? c.death_year - c.recruitment_year
        : 2023 - c.recruitment_year; // Censored

      events.push({
        duration,
        event: c.death_year !== null ? 1 : 0, // 1=death, 0=censored
        genus: c.genus,
      });
    }
  });

  return events;
}

/**
 * Compute size distribution bins (log scale)
 */
export function computeSizeBins(
  values: number[],
  binCount: number = 20
): Array<{ x0: number; x1: number; count: number }> {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);

  const logMin = Math.log10(min);
  const logMax = Math.log10(max);
  const logStep = (logMax - logMin) / binCount;

  const bins: Array<{ x0: number; x1: number; count: number }> = [];

  for (let i = 0; i < binCount; i++) {
    const x0 = Math.pow(10, logMin + i * logStep);
    const x1 = Math.pow(10, logMin + (i + 1) * logStep);

    const count = values.filter((v) => v >= x0 && v < x1).length;

    bins.push({ x0, x1, count });
  }

  return bins;
}
