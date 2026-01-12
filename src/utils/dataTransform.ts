/**
 * Data transformation utilities for parsing wide-format Excel data
 * into long-format coral observation records
 */

import { Coral, CoralObservation, Genus, Transect } from '../types/coral';

const YEARS = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
const YEAR_BLOCK_SIZE = 8;
const METADATA_COLS = 8;

/**
 * Parse measurement value handling missing data codes
 */
export function parseMeasurement(val: any): number | null {
  if (
    val === 'Na' ||
    val === 'na' ||
    val === 'UK' ||
    val === 'D' ||
    val === null ||
    val === undefined ||
    val === ''
  ) {
    return null;
  }

  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

/**
 * Parse a single observation from a row's year block
 */
export function parseObservation(
  row: any[],
  startCol: number,
  year: number,
  coralId: number,
  transect: Transect,
  genus: Genus,
  x: number,
  y: number
): CoralObservation | null {
  const d1 = row[startCol];
  const d2 = row[startCol + 1];
  const h = row[startCol + 2];
  const observer = row[startCol + 3];
  const status = row[startCol + 4];
  const growthRatio = row[startCol + 6];
  const fate = row[startCol + 7];

  // Skip if all Na (colony didn't exist this year)
  if (d1 === 'Na' && d2 === 'Na' && h === 'Na') {
    return null;
  }

  const diam1 = parseMeasurement(d1);
  const diam2 = parseMeasurement(d2);
  const height = parseMeasurement(h);

  const observation: CoralObservation = {
    coral_id: coralId,
    transect,
    genus,
    x,
    y,
    year,
    diam1,
    diam2,
    height,
    observer: observer && observer !== 'nan' ? observer : null,
    status: status && status !== 'nan' ? status : null,
    fate: fate && fate !== 'nan' ? fate : null,
    growth_ratio: parseMeasurement(growthRatio),
    is_alive: d1 !== 'D' && d2 !== 'D' && h !== 'D',
    is_recruit: false, // Will be computed below
  };

  // Check if this is a recruitment event
  if (observation.fate && observation.fate.toLowerCase().includes('recruitment')) {
    observation.is_recruit = true;
  }

  return observation;
}

/**
 * Enrich coral with computed fields
 */
export function enrichCoral(coral: Coral): Coral {
  // Add computed fields to each observation
  coral.observations.forEach((obs, i) => {
    if (obs.diam1 !== null && obs.diam2 !== null && obs.height !== null) {
      obs.geometric_mean_diam = Math.sqrt(obs.diam1 * obs.diam2);
      obs.volume_proxy = (obs.diam1 * obs.diam2 * obs.height) / 6;
    }

    // Growth rate relative to previous observation
    if (i > 0) {
      const prev = coral.observations[i - 1];
      if (prev.volume_proxy && obs.volume_proxy) {
        obs.growth_rate = Math.log(obs.volume_proxy / prev.volume_proxy);
      }
    }
  });

  // Colony-level summaries
  const aliveObs = coral.observations.filter((o) => o.is_alive);

  coral.recruitment_year =
    coral.observations.find((o) => o.is_recruit)?.year || aliveObs[0]?.year || null;

  coral.death_year =
    coral.observations.find((o) => o.fate && o.fate.toLowerCase().includes('death'))?.year || null;

  coral.max_size = Math.max(...aliveObs.map((o) => o.volume_proxy || 0));
  coral.lifespan = aliveObs.length;

  return coral;
}

/**
 * Parse Excel data from wide format to long format
 */
export function parseCoralData(rawData: any[][]): Coral[] {
  const corals: Coral[] = [];

  for (const row of rawData) {
    if (!row || row.length < METADATA_COLS) continue;

    const id = parseInt(row[0]);
    if (isNaN(id)) continue; // Skip header or invalid rows

    const transect = row[3] as Transect;
    const genus = row[4] as Genus;
    const x = parseFloat(row[5]);
    const y = parseFloat(row[6]);
    const z = parseFloat(row[7]);

    const coral: Coral = {
      id,
      transect,
      genus,
      x: isNaN(x) ? 0 : x,
      y: isNaN(y) ? 0 : y,
      z: isNaN(z) ? 0 : z,
      observations: [],
      recruitment_year: null,
      death_year: null,
      max_size: 0,
      lifespan: 0,
    };

    // Parse each year's data
    for (let i = 0; i < YEARS.length; i++) {
      const startCol = METADATA_COLS + i * YEAR_BLOCK_SIZE;
      const obs = parseObservation(row, startCol, YEARS[i], id, transect, genus, coral.x, coral.y);

      if (obs) {
        coral.observations.push(obs);
      }
    }

    // Enrich with computed fields
    enrichCoral(coral);

    corals.push(coral);
  }

  return corals;
}

/**
 * Apply filters to coral data
 */
export function applyFilters(
  corals: Coral[],
  filters: {
    selectedGenera: Genus[];
    selectedTransects: Transect[];
    yearRange: [number, number];
    minSize: number;
    maxSize: number;
  }
): Coral[] {
  return corals.filter((c) => {
    // Genus filter
    if (!filters.selectedGenera.includes(c.genus)) return false;

    // Transect filter
    if (!filters.selectedTransects.includes(c.transect)) return false;

    // Must have observation in year range
    const inRange = c.observations.some(
      (o) => o.year >= filters.yearRange[0] && o.year <= filters.yearRange[1] && o.is_alive
    );
    if (!inRange) return false;

    // Size filter (max size ever observed)
    if (c.max_size < filters.minSize || c.max_size > filters.maxSize) return false;

    return true;
  });
}
