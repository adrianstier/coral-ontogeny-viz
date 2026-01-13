/**
 * Hook for loading coral data from R-generated JSON files
 * Uses the coral_webapp.json file with all records
 */

import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { Coral, CoralObservation, Genus, Transect } from '../types/coral';

interface WebAppRecord {
  coral_id: number;
  year: number;
  transect: string;
  genus: string;
  genus_full: string;
  x: number;
  y: number;
  z: number;
  diam1?: number;
  diam2?: number;
  height?: number;
  geom_mean_diam?: number;
  volume_proxy?: number;
  fate?: string;
  is_recruit: boolean;
  died: boolean;
}

interface WebAppData {
  metadata: {
    name: string;
    years: [number, number];
    n_colonies: number;
    genera: string[];
    transects: string[];
    generated: string;
  };
  records: WebAppRecord[];
}

export function useCoralDataJSON() {
  const { setCorals, setLoading, setError } = useStore();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        console.log('Loading coral data from coral_webapp.json...');

        // Load the main webapp JSON file
        const response = await fetch('/data/coral_webapp.json');
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`);
        }

        const webAppData: WebAppData = await response.json();
        console.log('Loaded webapp data:', webAppData.metadata);

        // Group records by coral_id
        const coralMap = new Map<number, Coral>();

        webAppData.records.forEach((record) => {
          const coralId = record.coral_id;

          // Create coral entry if it doesn't exist
          if (!coralMap.has(coralId)) {
            coralMap.set(coralId, {
              id: coralId,
              transect: record.transect as Transect,
              genus: mapGenus(record.genus),
              x: record.x,
              y: record.y,
              z: record.z,
              observations: [],
              recruitment_year: null,
              death_year: null,
              max_size: 0,
              lifespan: 0,
            });
          }

          const coral = coralMap.get(coralId)!;

          // Create observation for this year
          const observation: CoralObservation = {
            coral_id: coralId,
            transect: coral.transect,
            genus: coral.genus,
            x: record.x,
            y: record.y,
            year: record.year,
            diam1: record.diam1 || 0,
            diam2: record.diam2 || 0,
            height: record.height || 0,
            observer: '',
            status: record.died ? 'dead' : 'alive',
            fate: record.fate || '',
            growth_ratio: 0,
            is_alive: !record.died,
            is_recruit: record.is_recruit,
            geometric_mean_diam: record.geom_mean_diam || 0,
            volume_proxy: record.volume_proxy || 0,
            growth_rate: 0,
          };

          coral.observations.push(observation);
        });

        // Process each coral to compute derived fields
        const corals = Array.from(coralMap.values()).map((coral) => {
          // Sort observations by year
          coral.observations.sort((a, b) => a.year - b.year);

          // Find recruitment year (first observation)
          coral.recruitment_year = coral.observations[0]?.year || null;

          // Find death year (first year marked as died)
          const deathObs = coral.observations.find((o) => !o.is_alive);
          coral.death_year = deathObs?.year || null;

          // Compute growth rates
          for (let i = 1; i < coral.observations.length; i++) {
            const prev = coral.observations[i - 1];
            const curr = coral.observations[i];

            if (
              prev.geometric_mean_diam &&
              curr.geometric_mean_diam &&
              prev.geometric_mean_diam > 0
            ) {
              curr.growth_rate = Math.log(curr.geometric_mean_diam / prev.geometric_mean_diam);
              curr.growth_ratio = curr.geometric_mean_diam / prev.geometric_mean_diam;
            }
          }

          // Max size
          coral.max_size = Math.max(
            ...coral.observations.map((o) => o.geometric_mean_diam || 0)
          );

          // Lifespan
          const lastYear = coral.observations[coral.observations.length - 1]?.year || 0;
          coral.lifespan = coral.death_year
            ? coral.death_year - (coral.recruitment_year || 0)
            : lastYear - (coral.recruitment_year || 0);

          return coral;
        });

        console.log(`✅ Loaded ${corals.length} coral colonies with ${webAppData.records.length} total observations`);

        // Log some sample data for debugging
        const sampleCoral = corals[0];
        if (sampleCoral) {
          console.log('Sample coral:', {
            id: sampleCoral.id,
            genus: sampleCoral.genus,
            observations: sampleCoral.observations.length,
            first_year: sampleCoral.observations[0]?.year,
            last_year: sampleCoral.observations[sampleCoral.observations.length - 1]?.year,
          });
        }

        setCorals(corals);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error loading coral data from JSON:', err);
        setError(err instanceof Error ? err.message : 'Unknown error loading JSON data');
        setLoading(false);
      }
    }

    loadData();
  }, [setCorals, setLoading, setError]);
}

// Map genus codes to standardized abbreviations
function mapGenus(genus: string): Genus {
  const genusMap: Record<string, Genus> = {
    'Poc': 'Poc',
    'Por': 'Por',
    'Acr': 'Acr',
    'Mil': 'Mil',
    'Pocillopora': 'Poc',
    'Porites': 'Por',
    'Acropora': 'Acr',
    'Millepora': 'Mil',
  };
  return genusMap[genus] || 'Poc';
}
